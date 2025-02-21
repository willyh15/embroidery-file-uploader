import { useState, useEffect } from "react";

export default function RoleManagement() {
  const [roleName, setRoleName] = useState("");
  const [storageLimit, setStorageLimit] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [username, setUsername] = useState("");
  const [analytics, setAnalytics] = useState([]);

  // Fetch storage analytics on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/get-analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, []);

  // Function to create a role with a storage limit
  const createRole = async () => {
    if (!roleName || !storageLimit) {
      alert("Please provide both role name and storage limit.");
      return;
    }

    try {
      const response = await fetch("/api/create-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName, storageLimit }),
      });

      if (!response.ok) throw new Error("Failed to create role");
      alert(`Role "${roleName}" created with ${storageLimit}MB storage limit.`);
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  // Function to assign a role to a user
  const assignRole = async () => {
    if (!username || !userRole) {
      alert("Please enter a username and select a role.");
      return;
    }

    try {
      const response = await fetch("/api/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roleName: userRole }),
      });

      if (!response.ok) throw new Error("Failed to assign role");
      alert(`Assigned role "${userRole}" to user "${username}".`);
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Role Management</h2>

      {/* Role Creation Section */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Create Role</h3>
        <input
          type="text"
          placeholder="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Storage Limit (MB)"
          value={storageLimit}
          onChange={(e) => setStorageLimit(e.target.value)}
        />
        <button onClick={createRole}>Create Role</button>
      </div>

      {/* Role Assignment Section */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Assign Role</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={assignRole}>Assign Role</button>
      </div>

      {/* Storage Analytics Section */}
      <div>
        <h3>Storage Usage Analytics</h3>
        <ul>
          {analytics.length > 0 ? (
            analytics.map((entry, index) => (
              <li key={index}>
                {entry.user}: {entry.storageUsed} KB used
              </li>
            ))
          ) : (
            <p>No analytics data available.</p>
          )}
        </ul>
      </div>
    </div>
  );
}