import { useState, useEffect, useRef } from "react";
import type { Todo } from "./types";
import { initTodos } from "./initTodos";
import WelcomeMessage from "./WelcomeMessage";
import TodoList from "./TodoList";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge"; // ◀◀ 追加
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // ◀◀ 追加
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"; // ◀◀ 追加

const App = () => {
  const [todos, setTodos] = useState<Todo[]>([]); 
  const [newTodoName, setNewTodoName] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState(3);
  const [newTodoDeadline, setNewTodoDeadline] = useState<Date | null>(null);
  const [newTodoNameError, setNewTodoNameError] = useState("");

  const [initialized, setInitialized] = useState(false); // ◀◀ 追加
  const localStorageKey = "TodoApp"; // ◀◀ 追加
  const themeStorageKey = "TodoApp.theme";

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("TodoApp.theme");
      return v === "dark";
    } catch (e) {
      return false;
    }
  });

  const uncompletedCount = todos.filter((todo: Todo) => !todo.isDone).length;

  useEffect(() => {
    const todoJsonStr = localStorage.getItem(localStorageKey);
    if (todoJsonStr) {
      // If something is stored under the key, try to parse it and use it.
      // Accept an empty array "[]" as a valid saved state (do not treat it as missing).
      try {
        const storedTodos: unknown = JSON.parse(todoJsonStr);
        if (Array.isArray(storedTodos)) {
          const convertedTodos = (storedTodos as Todo[]).map((todo) => ({
            ...todo,
            deadline: todo && (todo as any).deadline ? new Date((todo as any).deadline) : null,
          }));
          setTodos(convertedTodos);
        } else {
          // Stored value isn't an array (corrupted), fall back to defaults.
          setTodos(initTodos);
        }
      } catch (e) {
        console.error("Failed to parse todos from localStorage:", e);
        setTodos(initTodos);
      }
    } else {
      // No stored data: set initial todos.
      setTodos(initTodos);
    }
    setInitialized(true);
  }, []);

  // Apply theme on mount and when darkMode changes
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem(themeStorageKey, "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem(themeStorageKey, "light");
      }
    } catch (e) {
      // ignore
    }
  }, [darkMode]);

  // On initial load (ページ更新時)、30%の確率で背景に `stormdog.jpg` を適用する
  useEffect(() => {
    try {
      const roll = Math.random();
      if (roll < 0.3) {
        document.body.classList.add("stormdog-bg");
      } else {
        document.body.classList.remove("stormdog-bg");
      }
    } catch (e) {
      // ignore
    }
    // クリーンアップ: アンマウント時にクラスを残さない
    return () => {
      try {
        document.body.classList.remove("stormdog-bg");
      } catch (e) {}
    };
  }, []);

  // Persist todos to localStorage whenever they change (after initialization).
  // JSON.stringify will convert Date objects to ISO strings, which our load
  // logic converts back to Date via `new Date(...)` above.
  useEffect(() => {
    if (!initialized) return;
    try {
      const json = JSON.stringify(todos);
      console.log("Saving todos to localStorage:", json);
      localStorage.setItem(localStorageKey, json);
    } catch (e) {
      // If storage is full or forbidden, fail silently for now.
      console.error("Failed to save todos to localStorage:", e);
    }
  }, [todos, initialized]);

  

  // sort: primary = isDone (未完了(false) を先に), secondary = priority (小さい値が高優先度)、 tertiary = deadline (早い順)
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    if (a.priority !== b.priority) return a.priority - b.priority;
    const at = a.deadline ? a.deadline.getTime() : Infinity;
    const bt = b.deadline ? b.deadline.getTime() : Infinity;
    return at - bt;
  });

  const removeCompletedTodos = () => {
  const removedEntries = todos
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.isDone)
    .map(({ t, i }) => ({ item: t, index: i }));
  const updatedTodos = todos.filter((todo) => !todo.isDone);
  setTodos(updatedTodos);
  if (removedEntries.length > 0) scheduleUndo(removedEntries);
};

  // Remove a single todo by id (works regardless of isDone)
  const removeTodo = (id: string) => {
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return;
    const item = todos[index];
    const updated = todos.filter((t) => t.id !== id);
    setTodos(updated);
    scheduleUndo([{ item, index }]);
  };

  // Undo support
  const undoTimeoutRef = useRef<number | null>(null);
  const [lastDeleted, setLastDeleted] = useState<
    { item: Todo; index: number }[] | null
  >(null);

  const clearUndo = () => {
    if (undoTimeoutRef.current !== null) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    setLastDeleted(null);
  };

  const scheduleUndo = (entries: { item: Todo; index: number }[]) => {
    // replace any existing undo window
    clearUndo();
    setLastDeleted(entries);
    // 5 seconds to undo
    undoTimeoutRef.current = window.setTimeout(() => {
      undoTimeoutRef.current = null;
      setLastDeleted(null);
    }, 5000) as unknown as number;
  };

  const undoDelete = () => {
    if (!lastDeleted || lastDeleted.length === 0) return;
    // restore items at their original indices (sort by index asc)
    const restored = [...todos];
    const ordered = [...lastDeleted].sort((a, b) => a.index - b.index);
    for (const e of ordered) {
      const idx = Math.min(Math.max(0, e.index), restored.length);
      restored.splice(idx, 0, e.item);
    }
    setTodos(restored);
    clearUndo();
  };

  

  const updateIsDone = (id: string, value: boolean) => {
  const updatedTodos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, isDone: value }; // スプレッド構文
    } else {
      return todo;
    }
  });
  setTodos(updatedTodos);
  };

  const handleSelectTodo = (id: string) => {
    // previously used for Pomodoro selection; removed
  };

  // ▼▼ 追加
  const isValidTodoName = (name: string): string => {
    if (name.length < 2 || name.length > 32) {
      return "2文字以上、32文字以内で入力してください";
    } else {
      return "";
    }
  };

  const updateNewTodoName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoNameError(isValidTodoName(e.target.value)); // ◀◀ 追加
    setNewTodoName(e.target.value);
  };

  const updateNewTodoPriority = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodoPriority(Number(e.target.value));
  };

  const updateDeadline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dt = e.target.value; // UIで日時が未設定のときは空文字列 "" が dt に格納される
    console.log(`UI操作で日時が "${dt}" (${typeof dt}型) に変更されました。`);
    setNewTodoDeadline(dt === "" ? null : new Date(dt));
  };

  const addNewTodo = () => {
    // ▼▼ 編集
    const err = isValidTodoName(newTodoName);
    if (err !== "") {
      setNewTodoNameError(err);
      return;
    }
    const newTodo: Todo = {
      id: uuid(),
      name: newTodoName,
      isDone: false,
      priority: newTodoPriority,
      deadline: newTodoDeadline,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setNewTodoName("");
    setNewTodoPriority(3);
    setNewTodoDeadline(null);
  };

  return (
    <div className="mx-4 mt-10 max-w-2xl md:mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">TodoApp</h1>
        <div className="flex items-center">
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-2 rounded-md bg-red-600 px-3 py-1 text-sm font-bold text-white hover:bg-red-700"
          >
            YouTube
          </a>
          <a
            href="https://www.netflix.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mr-3 rounded-md bg-black px-3 py-1 text-sm font-bold text-white hover:opacity-90"
          >
            Netflix
          </a>
          <button
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            className={twMerge(
              "ml-2 rounded-md px-3 py-1 font-bold",
              darkMode ? "btn-accent" : "bg-gray-200 text-slate-800 hover:bg-gray-300"
            )}
          >
            {darkMode ? "ダーク: ON" : "ダーク: OFF"}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <WelcomeMessage
          name="寝屋川タヌキ"
          uncompletedCount={uncompletedCount}
        />
      </div>
  <TodoList todos={sortedTodos} onToggleIsDone={updateIsDone} onDeleteTodo={removeTodo} />
<button
  type="button"
  onClick={removeCompletedTodos}
  className={
    "mt-5 rounded-md bg-red-500 px-3 py-1 font-bold text-white hover:bg-red-600"
  }
>
  完了済みのタスクを削除
</button>
      <div className="mt-5 space-y-2 rounded-md border p-3">
        <h2 className="text-lg font-bold">新しいタスクの追加</h2>
        {/* 編集: ここから... */}
        <div>
          <div className="flex items-center space-x-2">
            <label className="font-bold" htmlFor="newTodoName">
              名前
            </label>
            <input
              id="newTodoName"
              type="text"
              value={newTodoName}
              onChange={updateNewTodoName}
              className={twMerge(
                "grow rounded-md border p-2",
                newTodoNameError && "border-red-500 outline-red-500"
              )}
              placeholder="2文字以上、32文字以内で入力してください"
            />
          </div>
          {newTodoNameError && (
            <div className="ml-10 flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newTodoNameError}</div>
            </div>
          )}
        </div>
        {/* ...ここまで */}

        <div className="flex gap-5">
          <div className="font-bold">優先度</div>
          {[1, 2, 3].map((value) => (
            <label key={value} className="flex items-center space-x-1">
              <input
                id={`priority-${value}`}
                name="priorityGroup"
                type="radio"
                value={value}
                checked={newTodoPriority === value}
                onChange={updateNewTodoPriority}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-x-2">
          <label htmlFor="deadline" className="font-bold">
            期限
          </label>
          <input
            type="datetime-local"
            id="deadline"
            value={
              newTodoDeadline
                ? dayjs(newTodoDeadline).format("YYYY-MM-DDTHH:mm:ss")
                : ""
            }
            onChange={updateDeadline}
            className="rounded-md border border-gray-400 px-2 py-0.5"
          />
        </div>

        <button
          type="button"
          onClick={addNewTodo}
          className={twMerge(
            "rounded-md bg-indigo-500 px-3 py-1 font-bold text-white hover:bg-indigo-600",
            newTodoNameError && "cursor-not-allowed opacity-50"
          )}
        >
          追加
        </button>
      </div>
        {/* Undo toast */}
        {lastDeleted && (
          <div className="fixed left-4 bottom-6 z-50">
            <div className="flex items-center space-x-2 rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-lg">
              <div>
                {lastDeleted.length} 件のタスクを削除しました。
              </div>
              <button
                className="rounded bg-white px-2 py-0.5 text-sm font-bold text-gray-800"
                onClick={undoDelete}
              >
                元に戻す
              </button>
              <button
                className="ml-2 rounded bg-transparent px-2 py-0.5 text-sm text-gray-300"
                onClick={() => clearUndo()}
              >
                閉じる
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default App;