import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  Code2,
  ChevronRight,
  Maximize2
} from "lucide-react";
import axios from "axios";

export default function MentorChatDrawer({ isOpen, onClose, solution }) {
  const [messages, setMessages] = useState([
    {
      role: "mentor",
      text: `Hello! I'm your AlgoCraft AI Mentor. I have full context on **${
        solution?.problem?.name || "this problem"
      }**. What would you like to clarify or explore deeper?`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Why not use a Greedy approach here?",
    "Explain the space complexity trade-off",
    "What edge case could cause an index error?",
    "Can you dry run this with duplicate values?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const generateOfflineMentorReply = (query, ctx) => {
    const q = query.toLowerCase();
    const name = ctx.name || "this problem";
    const lang = ctx.language || "C++";

    if (q.includes("time") || q.includes("complexity") || q.includes("o(") || q.includes("runtime")) {
      return `**Time Complexity Analysis for ${name}:**\n\nThe optimal approach runs in **${ctx.timeComplexity || "O(n)"}**.\n\n- Each element or state is visited a constant number of times.\n- Operations inside the loop (lookups, arithmetic, pointer moves) take $O(1)$ time.\n- In interviews, make sure to state whether the complexity is worst-case or amortized!`;
    }

    if (q.includes("space") || q.includes("memory") || q.includes("auxiliary")) {
      return `**Space Complexity Analysis for ${name}:**\n\nThe auxiliary space is **${ctx.spaceComplexity || "O(1)"}**.\n\n- ${ctx.spaceComplexity === "O(1)" ? "The algorithm operates strictly in-place using only a few primitive pointer variables." : `The auxiliary data structure can store up to $n$ elements in the worst case.`}\n- If an interviewer asks you to optimize memory further, discuss whether an in-place approach is possible at the expense of runtime.`;
    }

    if (q.includes("edge") || q.includes("duplicate") || q.includes("empty") || q.includes("null") || q.includes("boundary") || q.includes("negative")) {
      const edges = ctx.edgeCases?.length
        ? ctx.edgeCases.map(e => `• ${e}`).join("\n")
        : `• Empty or single-element inputs\n• Inputs with duplicate values\n• Extreme boundary values (e.g. INT_MAX, INT_MIN)`;
      return `**Critical Edge Cases for ${name}:**\n\n${edges}\n\n*Pro-tip for interviews:* Always test your whiteboard trace with at least two of these edge cases before telling the interviewer you're done!`;
    }

    if (q.includes("mistake") || q.includes("bug") || q.includes("wrong") || q.includes("error") || q.includes("trap")) {
      const mistakes = ctx.commonMistakes?.length
        ? ctx.commonMistakes.map(m => `• ${m}`).join("\n")
        : `• Off-by-one errors in loop boundaries\n• Not handling duplicates properly\n• Modifying state while iterating`;
      return `**Common Traps in ${name}:**\n\n${mistakes}\n\nDouble-check these points when writing your solution!`;
    }

    if (q.includes("code") || q.includes("line") || q.includes("implement") || q.includes("syntax")) {
      return `**Optimal Implementation Insight (${lang}):**\n\n${ctx.optimalCode ? `\`\`\`${lang.toLowerCase()}\n${ctx.optimalCode}\n\`\`\`\n\n` : ""}Key idea: The algorithm enforces a strict loop invariant. Every variable transition directly progresses toward the base condition without unnecessary recalculations.`;
    }

    if (q.includes("step") || q.includes("how") || q.includes("algorithm") || q.includes("approach")) {
      const steps = ctx.stepByStep?.length
        ? ctx.stepByStep.map((s, i) => `${i + 1}. **${s.title || `Step ${i + 1}`}**: ${s.detail || s}`).join("\n")
        : ctx.optimalIntuition;
      return `**Step-by-Step Logic for ${name}:**\n\n${steps}\n\nNotice how each step preserves correctness while keeping runtime strictly at **${ctx.timeComplexity || "O(n)"}**.`;
    }

    return `**Mentor Insight for ${name}:**\n\n${ctx.optimalIntuition || "Focus on the core invariant: verify what information from previous iterations eliminates redundant search."}\n\n- **Target Runtime:** ${ctx.timeComplexity || "O(n)"}\n- **Auxiliary Space:** ${ctx.spaceComplexity || "O(1)"}\n\nWhat specific line or test case would you like to dry run together?`;
  };

  const handleSend = async (userText) => {
    const query = (userText || input).trim();
    if (!query || loading) return;

    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const optimalApproach =
      solution?.content?.approaches?.find((a) => a.level === "Optimal") ||
      solution?.content?.approaches?.[0];

    const problemContext = {
      name: solution?.problem?.name || "Problem Analysis",
      topic: solution?.problem?.topic || "DSA",
      difficulty: solution?.problem?.difficulty || "Medium",
      platform: solution?.problem?.platform || "LeetCode",
      language: solution?.problem?.language || "C++",
      optimalIntuition: optimalApproach?.intuition || "",
      optimalCode: optimalApproach?.code || "",
      timeComplexity: optimalApproach?.timeComplexity || "O(n)",
      spaceComplexity: optimalApproach?.spaceComplexity || "O(1)",
      stepByStep: optimalApproach?.stepByStep || [],
      edgeCases: solution?.content?.edgeCases || [],
      commonMistakes: solution?.content?.commonMistakes || []
    };

    try {
      const res = await axios.post("/api/chat", {
        solutionId: solution?._id || "temp_solution",
        message: query,
        history: newMessages.slice(-6),
        problemContext
      });

      if (res.data?.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "mentor", text: res.data.reply }
        ]);
        return;
      }
      throw new Error("No reply returned");
    } catch (err) {
      // Dynamic problem-anchored mentor reply based on user's exact query
      const reply = generateOfflineMentorReply(query, problemContext);
      setMessages((prev) => [
        ...prev,
        { role: "mentor", text: reply }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0C111D] border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090D16]/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI DSA Mentor</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                100% Free
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
              Context: {solution?.problem?.name || "Algorithm Analysis"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isMentor = m.role === "mentor";
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isMentor ? "justify-start" : "justify-end"}`}
            >
              {isMentor && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0 flex items-center justify-center text-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed ${
                  isMentor
                    ? "bg-slate-900 border border-slate-800 text-slate-200 shadow-sm"
                    : "bg-indigo-600 text-white font-medium"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              {!isMentor && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex-shrink-0 flex items-center justify-center text-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center text-slate-400 text-xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span className="animate-pulse">Mentor is analyzing solution context...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          Suggested Questions:
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800 bg-[#090D16]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your mentor anything about this solution..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
