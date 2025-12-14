// js/app.js
// Simple client-side "backend" using localStorage for FocusFlow demo.

(function () {
    const STORAGE_KEY = "focusflow-demo-v1";
  
    function createDefaultData() {
      return {
        nextTaskId: 1,
        tasks: [],
        settings: {
          workDuration: 25,
          breakDuration: 5,
          notificationsEnabled: true,
          language: "en",
        },
      };
    }
  
    function loadData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const data = createDefaultData();
          saveData(data);
          return data;
        }
        const data = JSON.parse(raw);
        if (!data.tasks) data.tasks = [];
        if (!data.settings) data.settings = createDefaultData().settings;
        return data;
      } catch {
        const data = createDefaultData();
        saveData(data);
        return data;
      }
    }
  
    function saveData(data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  
    let cache = null;
  
    function getData() {
      if (!cache) {
        cache = loadData();
      }
      return cache;
    }
  
    function updateData(updater) {
      const data = getData();
      updater(data);
      saveData(data);
    }
  
    function createTask(dto) {
      let createdTask;
      updateData((data) => {
        const id = data.nextTaskId++;
        const now = new Date().toISOString();
        createdTask = {
          id,
          title: dto.title || "Untitled",
          category: dto.category || "",
          priority: dto.priority || "Medium",
          status: dto.status || "Pending",
          dueDate: dto.dueDate || null,
          estimatedMinutes: dto.estimatedMinutes || null,
          createdAt: now,
          completedAt: dto.status === "Completed" ? now : null,
        };
        data.tasks.push(createdTask);
      });
      return createdTask;
    }
  
    function updateTask(id, dto) {
      let updated = null;
      updateData((data) => {
        const t = data.tasks.find((x) => x.id === id);
        if (!t) return;
        t.title = dto.title ?? t.title;
        t.category = dto.category ?? t.category;
        t.priority = dto.priority ?? t.priority;
        const prevStatus = t.status;
        t.status = dto.status ?? t.status;
        t.dueDate = dto.dueDate ?? t.dueDate;
        t.estimatedMinutes = dto.estimatedMinutes ?? t.estimatedMinutes;
        if (prevStatus !== "Completed" && t.status === "Completed") {
          t.completedAt = new Date().toISOString();
        } else if (t.status !== "Completed") {
          t.completedAt = null;
        }
        updated = { ...t };
      });
      return updated;
    }
  
    function deleteTask(id) {
      let deleted = false;
      updateData((data) => {
        const idx = data.tasks.findIndex((x) => x.id === id);
        if (idx >= 0) {
          data.tasks.splice(idx, 1);
          deleted = true;
        }
      });
      return deleted;
    }
  
    function getTasks() {
      return (getData().tasks || []).slice();
    }
  
    function getSettings() {
      return { ...(getData().settings || createDefaultData().settings) };
    }
  
    function saveSettings(newSettings) {
      let saved;
      updateData((data) => {
        data.settings = { ...data.settings, ...newSettings };
        saved = { ...data.settings };
      });
      return saved;
    }
  
    function getTodaySummary() {
      const tasks = getTasks();
      const today = new Date();
      const todayStr = today.toISOString().substring(0, 10);
  
      const todayTasksCreated = tasks.filter(
        (t) => (t.createdAt || "").substring(0, 10) === todayStr
      );
      const todayTasksCompleted = tasks.filter(
        (t) => (t.completedAt || "").substring(0, 10) === todayStr
      );
      const completedAllTime = tasks.filter((t) => t.status === "Completed");
  
      const totalWorkMinutes = completedAllTime.reduce(
        (sum, t) => sum + (t.estimatedMinutes || 0),
        0
      );
      const totalPomodoros = Math.round(totalWorkMinutes / 25);
  
      const daysSet = new Set();
      completedAllTime.forEach((t) => {
        if (t.completedAt) {
          daysSet.add(t.completedAt.substring(0, 10));
        }
      });
      const currentStreak = Math.min(daysSet.size, 7);
  
      return {
        date: todayStr,
        tasksCreated: todayTasksCreated.length,
        tasksCompleted: todayTasksCompleted.length,
        totalWorkMinutes,
        totalPomodoros,
        currentStreakDays: currentStreak,
      };
    }
  
    window.FocusFlow = {
      getTasks,
      createTask,
      updateTask,
      deleteTask,
      getSettings,
      saveSettings,
      getTodaySummary,
    };
  })();
  