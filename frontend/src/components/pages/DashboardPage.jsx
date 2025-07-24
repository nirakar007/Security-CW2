import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth(); // We can get user data here
  return (
    <div className="text-white p-10">
      <h1 className="text-3xl">Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      {/* The file upload form will go here */}
    </div>
  );
};

export default DashboardPage;
