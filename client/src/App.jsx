import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SchedulePage } from "./pages/SchedulePage";
import { HomeworkPage } from "./pages/HomeworkPage";
import { MarksPage } from "./pages/MarksPage";
import { AuditoriumCallPage } from "./pages/AuditoriumCallPage";
import { WhiteboardPage } from "./pages/WhiteboardPage";
import { CodeRunnerPage } from "./pages/CodeRunnerPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center max-w-lg mx-auto my-16 bg-surface border-2 border-ink rounded-[10px] shadow-hard space-y-4">
          <div className="w-12 h-12 rounded-[6px] bg-danger/10 border-2 border-danger flex items-center justify-center text-danger mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-lg font-bold text-ink">Произошла ошибка при отображении раздела</h2>
          <p className="text-xs text-ink-muted font-mono">
            {this.state.error?.message || "Не удалось загрузить модуль."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn pri"
          >
            Перезагрузить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProfileId, setSelectedProfileId] = useState("me");
  const [selectedRoomId, setSelectedRoomId] = useState("web-dev-room-402");

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleOpenProfile = (studentId = "me") => {
    setSelectedProfileId(studentId);
    setActiveTab("profile");
  };

  const tabTitles = {
    dashboard: "Главная",
    profile: "Профиль студента",
    schedule: "Расписание",
    homework: "Домашние задания",
    marks: "Успеваемость",
    call: "Аудитория (Звонок)",
    whiteboard: "Электронная доска",
    code: "Песочница кода",
    leaderboard: "Рейтинг",
    settings: "Интеграция с API"
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col md:grid md:grid-cols-[248px_1fr]">
      {/* 1. Left Sidebar (desktop) & Bottom Navigation (mobile) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          onOpenProfile={() => handleOpenProfile("me")}
          pageTitle={tabTitles[activeTab] || "Главная"}
        />

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          <ErrorBoundary>
            {activeTab === "dashboard" && <DashboardPage setActiveTab={setActiveTab} />}
            {activeTab === "profile" && (
              <ProfilePage
                defaultStudentId={selectedProfileId}
                onSelectClassmate={(id) => setSelectedProfileId(id)}
              />
            )}
            {activeTab === "schedule" && (
              <SchedulePage
                setActiveTab={setActiveTab}
                onSelectRoom={(rid) => setSelectedRoomId(rid)}
              />
            )}
            {activeTab === "homework" && <HomeworkPage />}
            {activeTab === "marks" && <MarksPage />}
            {activeTab === "call" && (
              <AuditoriumCallPage
                setActiveTab={setActiveTab}
                roomId={selectedRoomId}
                setRoomId={setSelectedRoomId}
              />
            )}
            {activeTab === "whiteboard" && (
              <WhiteboardPage
                roomId={selectedRoomId}
                setRoomId={setSelectedRoomId}
              />
            )}
            {activeTab === "code" && <CodeRunnerPage />}
            {activeTab === "leaderboard" && (
              <LeaderboardPage
                onOpenProfile={(studentId) => handleOpenProfile(studentId)}
              />
            )}
            {activeTab === "settings" && <SettingsPage />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
