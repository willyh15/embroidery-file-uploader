import { useState, useEffect } from "react";

export default function RoleManagement() {
  const [roleName, setRoleName] = useState("");
  const [storageLimit, setStorageLimit] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [username, setUsername] = useState("");
  const [analytics, setAnalytics] = useState([]);

  // Fetch storage analytics on component mount
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/get-analytics");
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
    fetchAnalytics();
  }, []);

  const createRole = async () => {
  if (!roleName.trim() || !storageLimit) {
    alert("Please provide both role name and storage limit.");
    return;
  }

  try {
    const response = await fetch("/api/create-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleName, storageLimit }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to create role:", {
        status: response.status,
        statusText: response.statusText,
        body: data,
      });
      alert(`Error creating role: ${data?.error || response.statusText}`);
      return;
    }

    alert(`Role "${roleName}" created with ${storageLimit}MB storage limit.`);
    setRoleName("");
    setStorageLimit("");
  } catch (error) {
    console.error("Network or server error during role creation:", error);
    alert("Unexpected error creating role.");
  }
};
  const assignRole = async () => {
  if (!username.trim() || !userRole) {
    alert("Please enter a username and select a role.");
    return;
  }

  try {
    const response = await fetch("/api/assign-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, roleName: userRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to assign role:", {
        status: response.status,
        statusText: response.statusText,
        body: data,
      });
      alert(`Error assigning role: ${data?.error || response.statusText}`);
      return;
    }

    alert(`Assigned role "${userRole}" to user "${username}".`);
    setUsername("");
    setUserRole("user");
  } catch (error) {
    console.error("Network or server error during role assignment:", error);
    alert("Unexpected error assigning role.");
  }
};

  return (
    <div className="container fadeIn" style={{ maxWidth: "900px", margin: "2rem auto", textAlign: "center", padding: "0 1rem" }}>
      <h2>Role Management</h2>

      {/* Role Creation Section */}
      <div style={{ marginBottom: "2rem" }}>
        <h3>Create Role</h3>
        <input
          type="text"
          placeholder="Role Name"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.5rem", width: "200px" }}
        />
        <input
          type="number"
          placeholder="Storage Limit (MB)"
          value={storageLimit}
          onChange={(e) => setStorageLimit(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.5rem", width: "150px" }}
        />
        <button onClick={createRole} style={{ padding: "0.5rem 1rem" }}>
          Create Role
        </button>
      </div>

      {/* Role Assignment Section */}
      <div style={{ marginBottom: "2rem" }}>
        <h3>Assign Role</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.5rem", width: "200px" }}
        />
        <select
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
          style={{ marginRight: "0.5rem", padding: "0.5rem", width: "150px" }}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={assignRole} style={{ padding: "0.5rem 1rem" }}>
          Assign Role
        </button>
      </div>

      {/* Storage Analytics Section */}
      <div>
        <h3>Storage Usage Analytics</h3>
        {analytics.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, textAlign: "center" }}>
            {analytics.map((entry, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                <strong>{entry.user}</strong>: {entry.storageUsed} KB used
              </li>
            ))}
          </ul>
        ) : (
          <p>No analytics data available.</p>
        )}
      </div>
    </div>
  );
}