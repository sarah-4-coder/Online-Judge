import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main className="p-6 bg-black">{children}</main>
    </div>
  );
};

export default Layout;
