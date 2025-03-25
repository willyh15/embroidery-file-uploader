import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";

export default function RoleManagement() {
  const [roleName, setRoleName] = useState("");
  const [storageLimit, setStorageLimit] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [username, setUsername] = useState("");
  const [analytics, setAnalytics] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/get-analytics");
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Error loading analytics");
      setAnalytics(data.analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics.");
    }
  };

  const createRole = async () => {
    if (!roleName.trim() || !storageLimit) {
      toast.error("Please provide both role name and storage limit.");
      return;
    }

    try {
      const res = await fetch("/api/create-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName, storageLimit }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to create role:", data);
        toast.error(`Error: ${data?.error || "Unknown error"}`);
        return;
      }

      toast.success(`Created role "${roleName}"`);
      setRoleName("");
      setStorageLimit("");
      fetchAnalytics();
    } catch (err) {
      console.error("Error creating role:", err);
      toast.error("Unexpected error creating role.");
    }
  };

  const assignRole = async () => {
    if (!username.trim() || !userRole) {
      toast.error("Enter a username and select a role.");
      return;
    }

    try {
      const res = await fetch("/api/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roleName: userRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to assign role:", data);
        toast.error(`Error: ${data?.error || "Unknown error"}`);
        return;
      }

      toast.success(`Assigned "${userRole}" to "${username}"`);
      setUsername("");
      setUserRole("user");

      // Redirect with flag
      router.push("/?setupComplete=true");
    } catch (err) {
      console.error("Error assigning role:", err);
      toast.error("Unexpected error assigning role.");
    }
  };

  return (
    <div className="container fadeIn" style={{ maxWidth: "900px", margin: "2rem auto", textAlign: "center", padding: "0 1rem" }}>
      <Toaster position="top-right" />
      <h2>Role Management</h2>

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

      <div>
        <h3>Storage Usage Analytics</h3>
        {analytics.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
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