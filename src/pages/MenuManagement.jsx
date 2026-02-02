import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import { useMenu } from "../context/MenuContext";
import { useDebounce } from "../hooks/useDebounce";

const MenuManagement = () => {
  const { menuItems, setMenuItems } = useMenu();
  const [loading, setLoading] = useState(false); // Now used in UI
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // --- State for Order Processing ---
  const [orderModalItem, setOrderModalItem] = useState(null);
  const [orderData, setOrderData] = useState({
    customerName: "",
    tableNumber: "",
    quantity: 1,
  });

  // --- Filter and Form States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [isAvailableFilter, setIsAvailableFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const initialFormState = {
    name: "",
    description: "",
    category: "Appetizer",
    price: "",
    ingredients: "",
    isAvailable: true,
    preparationTime: "",
    imageUrl: "",
  };
  const [formItem, setFormItem] = useState(initialFormState);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Wrapped in useCallback to satisfy dependency rules
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("q", debouncedSearch);
    if (category) params.append("category", category);
    if (isAvailableFilter !== "")
      params.append("isAvailable", isAvailableFilter);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    const endpoint = debouncedSearch ? "/menu/search" : "/menu";
    try {
      const res = await fetch(`${API_URL}${endpoint}?${params.toString()}`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [
    API_URL,
    debouncedSearch,
    category,
    isAvailableFilter,
    minPrice,
    maxPrice,
    setMenuItems,
  ]);

  // Dependency array is now complete
  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ingredientsArray =
      typeof formItem.ingredients === "string"
        ? formItem.ingredients
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i !== "")
        : formItem.ingredients;

    const payload = {
      name: formItem.name,
      description: formItem.description,
      category: formItem.category,
      price: Number(formItem.price),
      ingredients: ingredientsArray,
      isAvailable: Boolean(formItem.isAvailable),
      preparationTime: Number(formItem.preparationTime),
    };

    if (formItem.imageUrl && formItem.imageUrl.trim() !== "") {
      payload.imageUrl = formItem.imageUrl;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/menu/${editingId}` : `${API_URL}/menu`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchMenu();
        resetForm();
      } else {
        const errData = await res.json();
        alert(`Request failed: ${errData.message || "Validation error"}`);
      }
    } catch (err) {
      alert("Error processing request");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await fetch(`${API_URL}/menu/${id}`, { method: "DELETE" });
      setMenuItems(menuItems.filter((item) => item._id !== id));
    }
  };

  const toggleAvailability = async (item) => {
    setMenuItems(
      menuItems.map((m) =>
        m._id === item._id ? { ...m, isAvailable: !m.isAvailable } : m,
      ),
    );
    try {
      await fetch(`${API_URL}/menu/${item._id}/availability`, {
        method: "PATCH",
      });
    } catch (err) {
      fetchMenu();
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setFormItem({
      ...item,
      ingredients: Array.isArray(item.ingredients)
        ? item.ingredients.join(", ")
        : item.ingredients || "",
      imageUrl: item.imageUrl || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormItem(initialFormState);
    setShowForm(false);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    const totalAmount = orderModalItem.price * orderData.quantity;
    const orderPayload = {
      items: [
        {
          menuItem: orderModalItem._id,
          quantity: Number(orderData.quantity),
          price: orderModalItem.price,
        },
      ],
      totalAmount: totalAmount,
      customerName: orderData.customerName,
      tableNumber: Number(orderData.tableNumber),
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        alert("Order Placed Successfully!");
        setOrderModalItem(null);
        setOrderData({ customerName: "", tableNumber: "", quantity: 1 });
      }
    } catch (err) {
      alert("Failed to place order");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Menu Management</h2>

      {/* Used 'loading' state to show a status message */}
      {loading && <p style={{ color: "blue" }}>Updating menu...</p>}

      {/* --- Order Modal --- */}
      {orderModalItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}>
          <form
            onSubmit={handleConfirmOrder}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
            }}>
            <h3>Order: {orderModalItem.name}</h3>
            <p>Unit Price: Rs.{orderModalItem.price}</p>
            <input
              required
              placeholder="Customer Name"
              style={{ width: "90%", marginBottom: "10px" }}
              onChange={(e) =>
                setOrderData({ ...orderData, customerName: e.target.value })
              }
            />
            <input
              required
              type="number"
              placeholder="Table Number"
              style={{ width: "90%", marginBottom: "10px" }}
              onChange={(e) =>
                setOrderData({ ...orderData, tableNumber: e.target.value })
              }
            />
            <input
              required
              type="number"
              min="1"
              value={orderData.quantity}
              style={{ width: "90%", marginBottom: "10px" }}
              onChange={(e) =>
                setOrderData({ ...orderData, quantity: e.target.value })
              }
            />
            <p>
              <strong>
                Total: Rs.{" "}
                {(orderModalItem.price * orderData.quantity).toFixed(2)}
              </strong>
            </p>
            <button
              type="submit"
              style={{
                background: "green",
                color: "white",
                marginRight: "10px",
              }}>
              Confirm Order
            </button>
            <button type="button" onClick={() => setOrderModalItem(null)}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* --- Filters --- */}
      <section
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
        }}>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {["Appetizer", "Main Course", "Dessert", "Beverage"].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select onChange={(e) => setIsAvailableFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="true">Available</option>
          <option value="false">Out of Stock</option>
        </select>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          style={{
            marginLeft: "auto",
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "4px",
          }}>
          {showForm ? "Close Form" : "+ Add Item"}
        </button>
      </section>

      {/* --- Add & Update Form --- */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}>
          <h3 style={{ gridColumn: "span 2" }}>
            {editingId ? "Update Menu Item" : "Add New Menu Item"}
          </h3>
          <input
            required
            placeholder="Name"
            value={formItem.name}
            onChange={(e) => setFormItem({ ...formItem, name: e.target.value })}
          />
          <select
            value={formItem.category}
            onChange={(e) =>
              setFormItem({ ...formItem, category: e.target.value })
            }>
            {["Appetizer", "Main Course", "Dessert", "Beverage"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            placeholder="Price"
            value={formItem.price}
            onChange={(e) =>
              setFormItem({ ...formItem, price: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Prep Time"
            value={formItem.preparationTime}
            onChange={(e) =>
              setFormItem({ ...formItem, preparationTime: e.target.value })
            }
          />
          <input
            placeholder="Image URL"
            value={formItem.imageUrl}
            onChange={(e) =>
              setFormItem({ ...formItem, imageUrl: e.target.value })
            }
          />
          <input
            placeholder="Ingredients"
            value={formItem.ingredients}
            onChange={(e) =>
              setFormItem({ ...formItem, ingredients: e.target.value })
            }
          />
          <button
            type="submit"
            style={{ background: "#007bff", color: "white", padding: "10px" }}>
            {editingId ? "Update Item" : "Save Item"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            style={{ background: "#6c757d", color: "white", padding: "10px" }}>
            Cancel
          </button>
        </form>
      )}

      {/* --- Table --- */}
      <table
        border="1"
        width="100%"
        style={{ borderCollapse: "collapse", textAlign: "left" }}>
        <thead style={{ background: "#343a40", color: "white" }}>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Quick Order</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <tr key={item._id}>
              <td style={{ textAlign: "center" }}>
                <img
                  src={item.imageUrl || "https://via.placeholder.com/50"}
                  alt={item.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </td>
              <td>
                <strong>{item.name}</strong>
                <p style={{ fontSize: "0.8em" }}>
                  {item.ingredients?.join(", ")}
                </p>
              </td>
              <td>{item.category}</td>
              <td>Rs. {item.price}</td>
              <td>
                <button onClick={() => toggleAvailability(item)}>
                  {item.isAvailable ? "Available" : "Out of Stock"}
                </button>
              </td>
              <td>
                <button onClick={() => startEdit(item)}>Edit</button>
                <button
                  onClick={() => handleDelete(item._id)}
                  style={{ color: "red" }}>
                  Delete
                </button>
              </td>
              <td>
                <button
                  disabled={!item.isAvailable}
                  onClick={() => setOrderModalItem(item)}>
                  Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MenuManagement;
