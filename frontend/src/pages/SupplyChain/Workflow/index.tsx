import React from "react";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Package,
  Truck,
  Wallet,
  CalendarRange,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../MicroKitchenSide/WorkFlow/WorkFlow.css";

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: "completed" | "current" | "pending";
}

const SupplyChainWorkFlow: React.FC = () => {
  const navigate = useNavigate();

  const steps: Step[] = [
    {
      id: 1,
      title: "Dashboard",
      description: "Monitor earnings, active deliveries, and service performance updates.",
      icon: <LayoutDashboard className="w-6 h-6" />,
      path: "/supplychain/dashboard",
      status: "completed",
    },
    {
      id: 2,
      title: "Delivery Questionnaire",
      description: "Complete your delivery profile and KYC details for verification.",
      icon: <FileText className="w-6 h-6" />,
      path: "/supplychain/delivery-questionnaire",
      status: "current",
    },
    {
      id: 3,
      title: "All Daily Work",
      description: "Review and manage all daily delivery assignments in your territory.",
      icon: <ClipboardList className="w-6 h-6" />,
      path: "/supplychain/daily-work",
      status: "pending",
    },
    {
      id: 4,
      title: "My Delivery Orders",
      description: "Track and process specific orders assigned specifically to you.",
      icon: <Package className="w-6 h-6" />,
      path: "/supplychain/seperate-orders",
      status: "pending",
    },
    {
      id: 5,
      title: "Delivery Feedback",
      description: "View customer ratings and reviews to improve service quality.",
      icon: <Truck className="w-6 h-6" />,
      path: "/supplychain/delivery-feedback",
      status: "pending",
    },
    {
      id: 6,
      title: "Earnings Tracking",
      description: "Monitor your delivery payouts and verified settlement details.",
      icon: <Wallet className="w-6 h-6" />,
      path: "/supplychain/earnings",
      status: "pending",
    },
    {
      id: 7,
      title: "Leave Management",
      description: "Manage your personal leave schedule and operational availability.",
      icon: <CalendarRange className="w-6 h-6" />,
      path: "/supplychain/planned-leave",
      status: "pending",
    },
  ];

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h1>Supply Chain Workflow</h1>
        <p>Your step-by-step guide to managing delivery operations and tracking performance.</p>
      </div>

      <div className="workflow-grid">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`workflow-card ${step.status}`}
            onClick={() => navigate(step.path)}
          >
            <div className="card-content">
              <div className="icon-wrapper">
                {step.icon}
                <div className="step-number">{step.id}</div>
              </div>
              <div className="text-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <div className="action-arrow">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="connector-line"></div>
            )}
          </div>
        ))}
      </div>

      <div className="workflow-footer">
        <div className="status-legend">
          <div className="legend-item">
            <span className="dot current"></span>
            <span>Active Step</span>
          </div>
          <div className="legend-item">
            <span className="dot pending"></span>
            <span>Next Steps</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainWorkFlow;
