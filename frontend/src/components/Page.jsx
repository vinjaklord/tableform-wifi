import React, { useState, useEffect } from "react";
import "./Page.css";

const Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    type: "expense",
    text: "Housing",
    amount: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8000/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();
      console.log("Fetched data:", result); // Debug
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to add data");
      setFormData({ date: "", type: "expense", text: "Housing", amount: "" });
      await fetchData();
    } catch (err) {
      console.error("Error adding data:", err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete data");
      await fetchData();
    } catch (err) {
      console.error("Error deleting data:", err);
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    console.log("Editing item:", item); // Debug
    setEditingId(item._id);
    setEditFormData({ ...item });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (id) => {
    console.log("Submitting edit for ID:", id); // Debug
    if (!id) {
      setError("No valid ID provided for edit");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/edit/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update data");
      }
      setEditingId(null);
      await fetchData();
    } catch (err) {
      console.error("Error updating data:", err);
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1>Data Table</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Text</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item._id}>
                {editingId === item._id ? (
                  <>
                    <td>
                      <input type="text" name="date" value={editFormData.date || ""} onChange={handleEditChange} className="edit-input" />
                    </td>
                    <td>
                      <select name="type" value={editFormData.type || "expense"} onChange={handleEditChange} className="edit-select">
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>
                    </td>
                    <td>
                      <select name="text" value={editFormData.text || "Housing"} onChange={handleEditChange} className="edit-select">
                        <option value="Housing">Housing</option>
                        <option value="Food">Food</option>
                        <option value="Weekend">Weekend</option>
                        <option value="Else">Else</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" name="amount" value={editFormData.amount || ""} onChange={handleEditChange} className="edit-input" />
                    </td>
                    <td>
                      <button onClick={() => handleEditSubmit(item._id)} className="save-button">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="cancel-button">
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.date}</td>
                    <td>{item.type}</td>
                    <td>{item.text}</td>
                    <td>{item.amount}</td>
                    <td>
                      <button onClick={() => handleEdit(item)} className="edit-button">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="delete-button">
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="form-container">
        <h2>Add New Entry</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Date:</label>
            <input type="text" name="date" value={formData.date} onChange={handleInputChange} placeholder="e.g., 2025/03/11" required />
          </div>
          <div className="form-row">
            <label>Type:</label>
            <select name="type" value={formData.type} onChange={handleInputChange} required>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="form-row">
            <label>Text:</label>
            <select name="text" value={formData.text} onChange={handleInputChange} required>
              <option value="Housing">Housing</option>
              <option value="Food">Food</option>
              <option value="Weekend">Weekend</option>
              <option value="Else">Else</option>
            </select>
          </div>
          <div className="form-row">
            <label>Amount:</label>
            <input type="text" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="e.g., 101" required />
          </div>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
