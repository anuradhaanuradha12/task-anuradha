import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer } from '../components/Toast';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (val) => {
    setSidebarOpen(typeof val === 'boolean' ? val : !sidebarOpen);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      {/* Toast Alert popups container */}
      <ToastContainer />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Viewport Content frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Header navigation bar */}
        <Navbar onMenuClick={() => toggleSidebar(true)} />
        
        {/* Main nested page content routing area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 dark:bg-background transition-colors duration-300">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AppLayout;
