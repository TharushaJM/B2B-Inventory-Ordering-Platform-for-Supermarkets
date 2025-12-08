// frontend/src/pages/supplier/SupplierDashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Charts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#00C49F", "#0088FE", "#FF8042"];

const SupplierDashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [productRes, orderRes] = await Promise.all([
          axios.get("/api/products/my-products", config),
          axios.get("/api/orders/supplier", config),
        ]);

        setProducts(productRes.data);
        setOrders(orderRes.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  // ---------- STAT COMPUTATION ----------
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive !== false).length;
  const lowStockProducts = products.filter((p) => p.stock <= 10).length;

  // ---------- PIE CHART DATA ----------
  const stockData = [
    { name: "Good Stock", value: products.filter((p) => p.stock > 20).length },
    { name: "Medium Stock", value: products.filter((p) => p.stock > 10 && p.stock <= 20).length },
    { name: "Low Stock", value: lowStockProducts },
  ];

  // ---------- ORDERS LINE CHART DATA ----------
  const ordersByMonth = {};
  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const month = date.toLocaleString("default", { month: "short" });

    ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
  });

  const monthlyOrdersData = Object.keys(ordersByMonth).map((month) => ({
    month,
    orders: ordersByMonth[month],
  }));

  return (
    <div className="admin-page">
      <h2 className="admin-header-title">Supplier Dashboard</h2>
      <p className="admin-header-subtitle">
        Manage your products, update stock, and track your business performance.
      </p>

      {/* ---------- STAT CARDS ---------- */}
      <div className="admin-card-grid">
        <div className="admin-card">
          <div className="admin-card-title">Total Products</div>
          <div className="admin-card-value">{totalProducts}</div>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Active Products</div>
          <div className="admin-card-value">{activeProducts}</div>
        </div>

        <div className="admin-card">
          <div className="admin-card-title">Low Stock Items</div>
          <div className="admin-card-value">{lowStockProducts}</div>
        </div>
      </div>

      {/* ---------- CHARTS SECTION ---------- */}
      <div className="dashboard-charts" style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
        
        {/* PIE CHART */}
        <div className="chart-card" style={{ flex: 1, background: "#fff", borderRadius: "10px", padding: "20px" }}>
          <h3>Stock Overview</h3>
          <PieChart width={300} height={280}>
            <Pie
              data={stockData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              label
              dataKey="value"
            >
              {stockData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* LINE CHART */}
        <div className="chart-card" style={{ flex: 1, background: "#fff", borderRadius: "10px", padding: "20px" }}>
          <h3>Monthly Orders</h3>
          <LineChart width={400} height={250} data={monthlyOrdersData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </div>

      </div>

      {/* ---------- ACTION BUTTONS ---------- */}
      <div className="admin-actions-row" style={{ marginTop: "30px" }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/supplier/products")}
        >
          Manage Products
        </button>

        <button
          className="btn"
          onClick={() => navigate("/supplier/add-product")}
        >
          Add New Product
        </button>
      </div>
    </div>
  );
};

export default SupplierDashboard;
