import React, { useCallback, useEffect, useState } from "react";
import { useMenu } from "../context/MenuContext";

const Dashboard = () => {
  const { menuItems } = useMenu();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.append("status", statusFilter);

      const res = await fetch(`${API_URL}/orders?${query.toString()}`);
      const data = await res.json();

      const ordersArray = Array.isArray(data) ? data : data.orders || [];
      setOrders(ordersArray);
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this order?")) {
      try {
        await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
        setOrders((prev) => prev.filter((o) => o._id !== id));
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Orders Dashboard</h1>

      {/* Filter Section */}
      <div style={{ marginBottom: "20px" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px" }}>
          <option value="">All Statuses</option>
          {["Pending", "Preparing", "Ready", "Delivered", "Cancelled"].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ),
          )}
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Order: {order.orderNumber}</strong>
              <div>
                {/* Fixed: Used setExpandedOrderId */}
                <button
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order._id ? null : order._id,
                    )
                  }>
                  {expandedOrderId === order._id
                    ? "Hide Details"
                    : "View Details"}
                </button>
                {/* Fixed: Used handleDelete */}
                <button
                  onClick={() => handleDelete(order._id)}
                  style={{ marginLeft: "10px", color: "red" }}>
                  Delete
                </button>
              </div>
            </div>

            <p>
              Customer: {order.customerName} | Table: {order.tableNumber}
            </p>

            {/* Fixed: Used handleStatusUpdate */}
            <div style={{ margin: "10px 0" }}>
              <label>Status: </label>
              <select
                value={order.status}
                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}>
                {[
                  "Pending",
                  "Preparing",
                  "Ready",
                  "Delivered",
                  "Cancelled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {expandedOrderId === order._id && (
              <table
                width="100%"
                style={{ marginTop: "10px", borderTop: "1px solid #eee" }}>
                <thead>
                  <tr align="left">
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => {
                    const itemName =
                      item.menuItem?.name ||
                      (typeof item.menuItem === "string" &&
                        menuItems.find((m) => m._id === item.menuItem)?.name) ||
                      "Unknown Item";

                    return (
                      <tr key={idx}>
                        <td>{itemName}</td>
                        <td>{item.quantity}</td>
                        <td>Rs. {item.price}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
