import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { RiHome7Fill, RiLogoutCircleLine, RiUserLine } from "react-icons/ri";
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const { logout, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    // Check if user is admin using AuthContext
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "admin") {
      navigate("/dashboard");
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
    fetchUsers();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      setDashboardData(data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.data.users);
    } catch (err) {
      console.error("Users error:", err);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Access Denied</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Portal</h1>
          <span className="admin-badge">Administrator</span>
        </div>
        <div className="admin-header-right">
          <span className="admin-email">
            {dashboardData?.admin?.email || "Admin"}
          </span>
          <button onClick={handleLogout} className="logout-btn">
            <RiLogoutCircleLine />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-sidebar">
          <ul>
            <li>
              <Link to="/">
                <RiHome7Fill />
                <span>Home</span>
              </Link>
            </li>
            <li
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              <span>Dashboard</span>
            </li>
            <li
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              <RiUserLine />
              <span>Users</span>
            </li>
          </ul>
        </nav>

        <main className="admin-main">
          {activeTab === "dashboard" && dashboardData && (
            <div className="dashboard-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">
                    {dashboardData.statistics.totalUsers}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Admin Users</h3>
                  <p className="stat-number stat-admin">
                    {dashboardData.statistics.adminUsers}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Regular Users</h3>
                  <p className="stat-number stat-user">
                    {dashboardData.statistics.regularUsers}
                  </p>
                </div>
              </div>
              <div className="admin-info">
                <h3>Logged in as:</h3>
                <p>
                  {dashboardData.admin.email} (ID: {dashboardData.admin.id})
                </p>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-section">
              <h2>All Users</h2>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          {user.firstName} {user.lastName}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`role-badge role-${user.role}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f5f5f5;
        }

        .admin-header {
          background: #2c3e50;
          color: white;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-header-left h1 {
          margin: 0;
          font-size: 1.5rem;
        }

        .admin-badge {
          background: #e74c3c;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-email {
          color: #bdc3c7;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: #e74c3c;
          color: white;
        }

        .admin-content {
          display: flex;
          min-height: calc(100vh - 70px);
        }

        .admin-sidebar {
          width: 250px;
          background: white;
          padding: 2rem 1rem;
          border-right: 1px solid #e0e0e0;
        }

        .admin-sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .admin-sidebar li {
          padding: 1rem;
          margin-bottom: 0.5rem;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-sidebar li:hover {
          background: #f0f0f0;
        }

        .admin-sidebar li.active {
          background: #3498db;
          color: white;
        }

        .admin-sidebar a {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-main {
          flex: 1;
          padding: 2rem;
        }

        .dashboard-section h2,
        .users-section h2 {
          margin-bottom: 2rem;
          color: #2c3e50;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .stat-card h3 {
          margin: 0 0 0.5rem 0;
          color: #7f8c8d;
          font-size: 0.875rem;
          text-transform: uppercase;
        }

        .stat-number {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .stat-admin {
          color: #e74c3c;
        }

        .stat-user {
          color: #3498db;
        }

        .admin-info {
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .admin-info h3 {
          margin: 0 0 0.5rem 0;
          color: #7f8c8d;
        }

        .users-table {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .users-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th,
        .users-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .users-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .role-admin {
          background: #e74c3c;
          color: white;
        }

        .role-user {
          background: #3498db;
          color: white;
        }

        .admin-loading,
        .admin-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 2rem;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}