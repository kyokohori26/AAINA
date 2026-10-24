import React, { useState, useEffect } from "react";
import { Plus, Users, MessageSquare, Mail, Trash2, Edit2, Shield, Heart } from "lucide-react";
import CircleMap from "../components/CircleMap";
import { circleAPI } from "../services/api";
import { useUserStore } from "../store/userStore";

export default function Circle() {
  const { user, profile, showToast } = useUserStore();
  const [people, setPeople] = useState([]);
  const [nudges, setNudges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add person modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRing, setNewRing] = useState("close friend");
  const [newNote, setNewNote] = useState("");

  const displayName = profile?.display_name || user?.name || "You";

  useEffect(() => {
    loadCircleData();
  }, []);

  const loadCircleData = async () => {
    setIsLoading(true);
    try {
      const [peopleRes, nudgesRes] = await Promise.all([
        circleAPI.getPeople(),
        circleAPI.getNudges()
      ]);
      setPeople(peopleRes.data);
      setNudges(nudgesRes.data);
    } catch (e) {
      showToast("Could not load Circle data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await circleAPI.addPerson({
        name: newName.trim(),
        ring: newRing,
        note: newNote.trim() || undefined
      });
      setPeople([...people, res.data]);
      setNewName("");
      setNewNote("");
      setShowAddModal(false);
      showToast(`Added ${res.data.name} to your Circle.`, "success");
      // Reload nudges
      const nudgesRes = await circleAPI.getNudges();
      setNudges(nudgesRes.data);
    } catch (e) {
      showToast("Could not add person to Circle.", "error");
    }
  };

  const handleDeletePerson = async (id) => {
    try {
      await circleAPI.deletePerson(id);
      setPeople(people.filter(p => p.id !== id));
      showToast("Removed from Circle.", "success");
    } catch (e) {
      showToast("Could not delete person.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Title & Add Person Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink">The Circle</h1>
          <p className="text-xs md:text-sm text-ink-muted mt-1">
            Real-world connection. Aaina supports you, but never replaces human relationships.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-button bg-mirror-blue hover:bg-mirror-hover text-white text-xs font-bold shadow-mirror transition-all active:scale-95 tap-target"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Circle</span>
        </button>
      </div>

      {/* Visual Concentric Map Card */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft flex flex-col items-center">
        <CircleMap people={people} userName={displayName} />
      </div>

      {/* Reach-out Nudges Section */}
      {nudges.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-peach" />
            <span>Gentle Reach-Out Suggestions</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nudges.map((nudge) => (
              <div
                key={nudge.person_id}
                className="p-4 rounded-card bg-gradient-to-r from-cream-50 to-mirror-light/40 border border-cream-300 shadow-soft flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-ink">{nudge.name}</span>
                    <span className="text-[10px] font-semibold text-ink-muted capitalize">
                      {nudge.ring}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mb-3 leading-relaxed">
                    {nudge.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-cream-200">
                  <a
                    href={nudge.sms_link}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-input bg-white border border-cream-300 hover:border-mirror-blue text-xs font-bold text-mirror-blue transition-colors shadow-soft"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send SMS</span>
                  </a>
                  <a
                    href={nudge.email_link}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-input bg-white border border-cream-300 hover:border-lavender text-xs font-bold text-lavender-dark transition-colors shadow-soft"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List of People in Circle */}
      <div className="p-6 rounded-card bg-white border border-cream-300 shadow-soft">
        <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-mirror-blue" />
          <span>People in your Circle ({people.length})</span>
        </h3>

        {people.length === 0 ? (
          <p className="text-xs text-ink-muted text-center py-4">
            You haven't added anyone to your Circle yet. Add friends, family, or mentors!
          </p>
        ) : (
          <div className="space-y-2.5">
            {people.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-input bg-cream-50/70 border border-cream-200"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ink">{p.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-cream-300 capitalize text-ink-muted">
                      {p.ring}
                    </span>
                  </div>
                  {p.note && (
                    <p className="text-xs text-ink-muted mt-0.5">{p.note}</p>
                  )}
                </div>

                <button
                  onClick={() => handleDeletePerson(p.id)}
                  className="p-1.5 text-ink-light hover:text-rose-500 rounded-button transition-colors"
                  title="Remove from Circle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Promise Banner */}
      <div className="p-4 rounded-card bg-cream-50 border border-cream-200 text-xs text-ink-muted flex items-start gap-3">
        <Shield className="w-4 h-4 text-mirror-blue flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy Promise:</strong> Aaina never contacts anyone on your behalf. All suggestions only open your own messaging app so you are always in complete control.
        </p>
      </div>

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-mirror-lg max-w-sm w-full p-6 border border-cream-300">
            <h3 className="text-base font-bold text-ink mb-3">Add to your Circle</h3>
            <form onSubmit={handleAddPerson} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Riya, Mom, Professor Das"
                  className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs font-semibold text-ink focus:border-mirror-blue outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Relationship Ring</label>
                <select
                  value={newRing}
                  onChange={(e) => setNewRing(e.target.value)}
                  className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs font-semibold text-ink"
                >
                  <option value="close friend">Close Friend</option>
                  <option value="family">Family</option>
                  <option value="colleague">Colleague / Mentor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Personal Note (optional)</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Study buddy, always shares good chai"
                  className="w-full px-3 py-2 rounded-input border border-cream-300 text-xs text-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-button text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-button bg-mirror-blue text-white text-xs font-bold shadow-sm hover:bg-mirror-hover"
                >
                  Add Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
