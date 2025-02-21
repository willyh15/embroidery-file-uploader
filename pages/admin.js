const [roleName, setRoleName] = useState("");
const [storageLimit, setStorageLimit] = useState("");
const [userRole, setUserRole] = useState("");
const [username, setUsername] = useState("");

const createRole = async () => {
  await fetch("/api/create-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roleName, storageLimit }),
  });
};

const assignRole = async () => {
  await fetch("/api/assign-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, roleName: userRole }),
  });
};

<input type="text" placeholder="Role Name" onChange={(e) => setRoleName(e.target.value)} />
<input type="number" placeholder="Storage Limit (MB)" onChange={(e) => setStorageLimit(e.target.value)} />
<button onClick={createRole}>Create Role</button>

<input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
<select onChange={(e) => setUserRole(e.target.value)}>
  <option value="user">User</option>
  <option value="admin">Admin</option>
</select>
<button onClick={assignRole}>Assign Role</button>
