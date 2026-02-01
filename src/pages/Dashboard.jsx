import React, { useEffect, useState } from "react";
import { useMenu } from "../context/MenuContext";

const Dashboard = () => {
  const { menuItems } = useMenu(); // Keep this for backup lookup if needed
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.append("status", statusFilter);

      const res = await fetch(`${API_URL}/orders?${query.toString()}`);
      const data = await res.json();

      // Extract the array correctly from { orders: [...] } or [...]
      const ordersArray = Array.isArray(data) ? data : data.orders || [];
      setOrders(ordersArray);
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

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
      await fetch(`${API_URL}/orders/${id}`, { method: "DELETE" });
      setOrders(orders.filter((o) => o._id !== id));
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Orders Dashboard</h1>

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
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "15px",
                  backgroundColor: "#fff",
                }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <div>
                    <strong>Order: {order.orderNumber}</strong>
                    <p style={{ margin: "5px 0" }}>
                      Customer: {order.customerName} | Table:{" "}
                      {order.tableNumber}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, e.target.value)
                      }>
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
                    <button
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order._id ? null : order._id,
                        )
                      }>
                      {expandedOrderId === order._id ? "Hide" : "Details"}
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      style={{ color: "red" }}>
                      Delete
                    </button>
                  </div>
                </div>

                {expandedOrderId === order._id && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "10px",
                      background: "#f1f1f1",
                      borderRadius: "5px",
                    }}>
                    <table width="100%" style={{ borderCollapse: "collapse" }}>
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid #ccc",
                            textAlign: "left",
                          }}>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item, idx) => {
                          // FALLBACK: If API didn't populate name, look it up in context
                          if (!item.menuItem?.name) {
                            console.log(
                              `Order ${order.orderNumber} Item ${idx} structure:`,
                              item,
                            );
                          }

                          // 2. Comprehensive Name Resolution
                          // Check populated object -> Check Context -> Fallback to ID -> Fallback to "Unknown"
                          const itemName =
                            item.menuItem?.name ||
                            (typeof item.menuItem === "string" &&
                              menuItems.find((m) => m._id === item.menuItem)
                                ?.name) ||
                            item.menuItem?._id ||
                            "Unknown Item";

                          return (
                            <tr key={idx}>
                              <td>{itemName}</td>
                              <td>{item.quantity}</td>
                              <td>Rs. {item.price}</td>
                              <td>
                                Rs. {(item.quantity * item.price).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                      <strong>Grand Total: Rs. {order.totalAmount}</strong>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
