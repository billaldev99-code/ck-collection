import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
export default function MainLayout() {
  return (<><Header /><main style={{ minHeight: "70vh" }}><Outlet /></main><Footer /></>);
}
