import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  PartyPopper,
  Sparkles,
  CalendarDays,
  MapPin,
  Send,
  Rocket,
  Volume2,
  VolumeX,
} from "lucide-react";

const questions = [
  {
    question: "Question 1: Are you free for a little adventure?",
    options: ["Absolutely", "Tell me more", "Only if snacks are involved"],
    reply: "Excellent. Adventure mode is now loading.",
  },
  {
    question: "Question 2: How many will be attending?",
    options: ["1 Adult", "1 Adult + 1 Child"],
    reply: "Brilliant. The guest list has been updated.",
  },
  {
    question: "Question 3: What kind of date sounds best?",
    options: ["Dinner", "Coffee", "Drinks", "Surprise me"],
    reply: "Strong choice. The planning committee approves.",
  },
  {
    question: "Question 4: Should I dress smart, casual, or dangerously charming?",
    options: ["Smart", "Casual", "Dangerously charming"],
    reply: "Noted. Outfit strategy is under review.",
  },
];

function buildRsvpSummary(answers, formattedDate, venueSuggestion) {
  return [
    `Adventure: ${answers[0] || "Not answered"}`,
    `Attending: ${answers[1] || "Not answered"}`,
    `Date type: ${answers[2] || "Not answered"}`,
    `Dress preference: ${answers[3] || "Not answered"}`,
    `Selected date: ${formattedDate || "Not selected"}`,
    `Venue suggestion: ${venueSuggestion || "No venue suggestion provided"}`,
  ].join("\n");
}

export default function AnimatedDateInvite() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [venueSuggestion, setVenueSuggestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicBlocked, setMusicBlocked] = useState(false);

  const audioRef = useRef(null);

  const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

  const floatingConfetti = useMemo(
    () => Array.from({ length: 26 }, (_, i) => i),
    []
  );

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.volume = 0.25;

    audioRef.current
      .play()
      .then(() => {
        setMusicPlaying(true);
        setMusicBlocked(false);
      })
      .catch(() => {
        setMusicPlaying(false);
        setMusicBlocked(true);
      });
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setMusicPlaying(true);
        setMusicBlocked(false);
      } catch {
        setMusicBlocked(true);
      }
    } else {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  };

  const chooseAnswer = (answer) => {
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 500);
    } else {
      setTimeout(() => setShowInvite(true), 650);
    }
  };

  const sendRsvpEmail = async () => {
    setSendError("");

    if (!selectedDate) {
      setSendError("Please choose a date before sending your RSVP.");
      return;
    }

    setIsSending(true);

    const fullSummary = buildRsvpSummary(
      answers,
      formattedDate,
      venueSuggestion
    );

    const templateParams = {
      adventure_answer: answers[0] || "Not answered",
      attending_answer: answers[1] || "Not answered",
      date_type_answer: answers[2] || "Not answered",
      dress_answer: answers[3] || "Not answered",
      selected_date: formattedDate || "Not selected",
      venue_suggestion:
        venueSuggestion || "No venue suggestion provided",
      full_summary: fullSummary,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSent(true);
    } catch {
      setSendError(
        "Sorry, something went wrong while sending. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setShowInvite(false);
    setSelectedDate("");
    setVenueSuggestion("");
    setIsSending(false);
    setSent(false);
    setSendError("");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-cyan-100 via-amber-50 to-orange-100 flex items-center justify-center p-6 text-slate-900 relative">
      <audio ref={audioRef} src="/retro1.mp3" loop preload="auto" />

      <button
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-30 rounded-full bg-white/90 p-3 shadow-lg border border-orange-200 hover:bg-orange-50"
        aria-label="Toggle music"
      >
        {musicPlaying ? (
          <Volume2 className="text-orange-600" size={24} />
        ) : (
          <VolumeX className="text-orange-600" size={24} />
        )}
      </button>

      {musicBlocked && (
        <button
          onClick={toggleMusic}
          className="fixed top-20 right-4 z-30 rounded-2xl bg-orange-600 text-white px-4 py-2 font-bold shadow-lg"
        >
          Tap to start music 🎵
        </button>
      )}

      {floatingConfetti.map((piece) => (
        <motion.div
          key={piece}
          className="absolute text-orange-400/50"
          initial={{
            y: "-10vh",
            x: `${Math.random() * 100}vw`,
            opacity: 0,
            rotate: 0,
            scale: 0.7,
          }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 1, 0],
            rotate: 360,
            scale: [0.7, 1.15, 0.9],
          }}
          transition={{
            duration: 7 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 7,
          }}
        >
          {piece % 2 === 0 ? (
            <PartyPopper size={16 + Math.random() * 18} />
          ) : (
            <Sparkles size={16 + Math.random() * 18} />
          )}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-2xl z-10"
      >
        <div className="rounded-[2rem] border border-white/80 bg-white/85 backdrop-blur-xl shadow-2xl ring-4 ring-white/40">
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-center gap-2 mb-6 text-orange-600">
              <PartyPopper className="animate-bounce" />
              <span className="font-bold tracking-wide uppercase text-sm">
                Adventure Invite 🎉
              </span>
              <Sparkles className="animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              {!showInvite ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <motion.h1
                    className="text-3xl md:text-5xl font-black mb-4 leading-tight"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  >
                    {questions[step].question}
                  </motion.h1>

                  <p className="text-slate-600 mb-8 text-lg">
                    Choose carefully. This may affect the entire mission.
                  </p>

                  <div className="grid gap-3">
                    {questions[step].options.map((option) => (
                      <motion.button
                        key={option}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => chooseAnswer(option)}
                        className="rounded-2xl bg-orange-500 text-white px-5 py-4 font-bold shadow-lg hover:bg-orange-600 transition border-b-4 border-orange-700"
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>

                  {answers.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-orange-700 font-bold"
                    >
                      {questions[Math.max(0, step - 1)].reply}
                    </motion.p>
                  )}

                  <div className="mt-8 flex justify-center gap-2">
                    {questions.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2.5 rounded-full transition-all ${
                          index === step
                            ? "w-8 bg-orange-500"
                            : "w-2.5 bg-orange-200"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="invite"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ rotate: -8, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 170,
                      damping: 10,
                    }}
                    className="mx-auto mb-6 w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-xl"
                  >
                    <Rocket size={42} />
                  </motion.div>

                  <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                    Alright… fancy making this official? 😎
                  </h1>

                  <p className="text-lg text-slate-600 mb-8">
                    Based on your highly scientific answers, this plan has
                    serious potential.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 text-left mb-8">
                    <div className="rounded-2xl bg-white p-5 shadow flex gap-3 items-start">
                      <CalendarDays className="text-orange-500 mt-1" />
                      <div className="w-full">
                        <p className="font-bold">When</p>
                        <p className="text-slate-600 mb-3">
                          Pick a date that suits you
                        </p>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(event) =>
                            setSelectedDate(event.target.value)
                          }
                          className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                        {selectedDate && (
                          <p className="mt-3 text-sm font-semibold text-orange-700">
                            Date selected: {formattedDate}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow flex gap-3 items-start">
                      <MapPin className="text-orange-500 mt-1" />
                      <div className="w-full">
                        <p className="font-bold">Where</p>
                        <p className="text-slate-600 mb-3">
                          If you have any preferences or suggestions on venue
                          please let me know
                        </p>
                        <textarea
                          value={venueSuggestion}
                          onChange={(event) =>
                            setVenueSuggestion(event.target.value)
                          }
                          placeholder="Dinner spot, coffee place, cocktails, hidden gem..."
                          rows={4}
                          className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-slate-700 outline-none resize-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-orange-50 p-5 mb-8 text-left">
                    <p className="font-bold mb-2">Your answers:</p>
                    <ul className="space-y-1 text-slate-700">
                      {answers.map((answer, index) => (
                        <li key={`${answer}-${index}`}>🎉 {answer}</li>
                      ))}
                      {selectedDate && <li>📅 {formattedDate}</li>}
                      {venueSuggestion && <li>📍 {venueSuggestion}</li>}
                    </ul>
                  </div>

                  {sendError && (
                    <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                      {sendError}
                    </p>
                  )}

                  {sent && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 rounded-2xl bg-orange-100 px-4 py-3 text-sm font-semibold text-orange-700"
                    >
                      RSVP sent. Adventure request submitted 🚀
                    </motion.p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={sendRsvpEmail}
                      disabled={isSending || sent}
                      className="rounded-2xl px-6 py-4 text-base bg-orange-600 hover:bg-orange-700 disabled:opacity-60 font-bold border-b-4 border-orange-800 text-white inline-flex items-center justify-center"
                    >
                      <Send className="mr-2" size={18} />
                      {isSending
                        ? "Sending..."
                        : sent
                        ? "Sent 🚀"
                        : "Yes, obviously"}
                    </button>

                    <button
                      onClick={restart}
                      className="rounded-2xl px-6 py-4 text-base border border-orange-300 font-bold bg-white hover:bg-orange-50"
                    >
                      Replay invite
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
