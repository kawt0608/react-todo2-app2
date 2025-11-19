import React from "react";
import type { Todo } from "./types";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFile,
  faClock,
  faFaceGrinWide,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  todos: Todo[];
  onToggleIsDone: (id: string, value: boolean) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo?: (id: string, patch: Partial<Todo>) => void;
  onSelectTodo?: (id: string) => void;
};

const num2star = (n: number): string => "★".repeat(4 - n);

const TodoList = (props: Props) => {
  const { todos, onToggleIsDone, onDeleteTodo, onSelectTodo, onUpdateTodo } = props;
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<{ name: string; priority: number; deadline: string }>({
    name: "",
    priority: 3,
    deadline: "",
  });

  if (todos.length === 0) {
    return (
      <div className="text-red-500">
        現在、登録されているタスクはありません。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={twMerge(
            "rounded-md border border-slate-500 bg-white px-3 py-2 drop-shadow-md",
            todo.isDone && "bg-blue-50 opacity-50"
          )}
        >
          {todo.isDone && (
            <div className="mb-1 rounded bg-blue-400 px-2 py-0.5 text-center text-xs text-white">
              <FontAwesomeIcon icon={faFaceGrinWide} className="mr-1.5" />
              完了済み
              <FontAwesomeIcon icon={faFaceGrinWide} className="ml-1.5" />
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-baseline text-slate-700 gap-2 sm:gap-0">
            <div className="flex items-center flex-wrap gap-2">
              <input
                type="checkbox"
                checked={todo.isDone}
                className="mr-1.5 cursor-pointer"
                onChange={(e) => onToggleIsDone(todo.id, e.currentTarget.checked)}
              />
              <FontAwesomeIcon icon={faFile} flip="horizontal" className="mr-1" />
              {editingId === todo.id ? (
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  className={twMerge(
                    "text-lg font-bold rounded-md border p-1 w-full sm:w-auto",
                    todo.isDone && "line-through decoration-2"
                  )}
                />
              ) : (
                <div
                  className={twMerge(
                    "text-lg font-bold cursor-pointer",
                    todo.isDone && "line-through decoration-2"
                  )}
                  onClick={() => {
                    if (typeof onSelectTodo === "function") onSelectTodo(todo.id);
                  }}
                  title="クリックでポモドーロを開始"
                >
                  {todo.name}
                </div>
              )}
              <div className="ml-2">優先度 </div>
              <div className="ml-2 text-orange-400">
                {editingId === todo.id ? (
                  <select
                    value={draft.priority}
                    onChange={(e) => setDraft((d) => ({ ...d, priority: Number(e.target.value) }))}
                    className="rounded-md border px-1 py-0.5 w-full sm:w-auto"
                  >
                    {[1, 2, 3].map((v) => (
                      <option key={v} value={v}>{`${v} (${num2star(v)})`}</option>
                    ))}
                  </select>
                ) : (
                  num2star(todo.priority)
                )}
              </div>
            </div>

            <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 flex flex-wrap items-center space-x-2">
              {editingId === todo.id ? (
                <>
                  <button
                    className="rounded bg-green-100 px-2 py-1 text-sm font-bold text-green-700 hover:bg-green-200"
                    onClick={() => {
                      if (typeof onUpdateTodo === "function") {
                        const patch: Partial<Todo> = {
                          name: draft.name,
                          priority: draft.priority,
                          deadline: draft.deadline ? new Date(draft.deadline) : null,
                        };
                        onUpdateTodo(todo.id, patch);
                      }
                      setEditingId(null);
                    }}
                  >
                    保存
                  </button>
                  <button
                    className="rounded bg-gray-100 px-2 py-1 text-sm font-bold text-gray-700 hover:bg-gray-200"
                    onClick={() => setEditingId(null)}
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(todo.id);
                      setDraft({
                        name: todo.name,
                        priority: todo.priority,
                        deadline: todo.deadline ? new Date(todo.deadline).toISOString().slice(0,19) : "",
                      });
                    }}
                    className="rounded bg-slate-100 px-2 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTodo(todo.id)}
                    className="rounded bg-red-100 px-2 py-1 text-sm font-bold text-red-600 hover:bg-red-200"
                  >
                    削除
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="ml-0 sm:ml-4 mt-1 sm:mt-0 flex items-center text-sm text-slate-500">
            <FontAwesomeIcon
              icon={faClock}
              flip="horizontal"
              className="mr-1.5"
            />
            {editingId === todo.id ? (
              <input
                type="datetime-local"
                value={draft.deadline}
                onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))}
                className="rounded-md border border-gray-400 px-2 py-0.5 w-full sm:w-auto"
              />
            ) : (
              todo.deadline && (
                <div className={twMerge(todo.isDone && "line-through")}>
                  期限: {dayjs(todo.deadline).format("YYYY年M月D日 H時m分")}
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoList;