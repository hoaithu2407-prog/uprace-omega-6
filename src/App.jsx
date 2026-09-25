import React, { useState, useMemo } from 'react';
import { 
  Trophy, Flame, ShieldAlert, Award, Calendar, ChevronRight, 
  CheckCircle, AlertTriangle, PlusCircle, Users, Activity,
  Filter, Sparkles, User, RefreshCw
} from 'lucide-react';

// Dữ liệu ban đầu của 2 đội
const INITIAL_MEMBERS = {
  1: [
    "Thanh Nhã", "Huỳnh Tuấn", "Tùng Trần", "Nguyễn Quân", "Lợi Cao",
    "Lê Hà", "Hà Trần", "An Đào", "Mỹ Linh", "Văn Lê"
  ],
  2: [
    "Lê Lợi", "Danh Nguyễn", "Khánh Hòa", "Lê Thương", "Hưng Nguyễn",
    "Vũ Hậu", "Tùng Tiger", "Quỳnh Anh", "Bảo Việt", "Trâm Lê"
  ]
};

// Dữ liệu mẫu khởi tạo
const INITIAL_TRACKS = [
  // Đội 1
  { id: 1, teamId: 1, member: "Thanh Nhã", date: "2026-09-21", type: "swim", distance: 1200, pace: 4.5, week: 1 },
  { id: 2, teamId: 1, member: "Huỳnh Tuấn", date: "2026-09-21", type: "run", distance: 5000, pace: 6.2, week: 1 },
  { id: 3, teamId: 1, member: "Tùng Trần", date: "2026-09-22", type: "run", distance: 8000, pace: 5.8, week: 1 },
  { id: 4, teamId: 1, member: "Văn Lê", date: "2026-09-22", type: "swim", distance: 2000, pace: 3.8, week: 1 },
  { id: 5, teamId: 1, member: "Thanh Nhã", date: "2026-09-23", type: "run", distance: 12000, pace: 5.5, week: 1 },
  
  // Đội 2
  { id: 6, teamId: 2, member: "Lê Lợi", date: "2026-09-21", type: "swim", distance: 1500, pace: 4.2, week: 1 },
  { id: 7, teamId: 2, member: "Danh Nguyễn", date: "2026-09-21", type: "run", distance: 6000, pace: 5.9, week: 1 },
  { id: 8, teamId: 2, member: "Khánh Hòa", date: "2026-09-22", type: "swim", distance: 1000, pace: 5.0, week: 1 },
  { id: 9, teamId: 2, member: "Tùng Tiger", date: "2026-09-22", type: "run", distance: 10000, pace: 5.2, week: 1 },
  { id: 10, teamId: 2, member: "Quỳnh Anh", date: "2026-09-23", type: "run", distance: 7000, pace: 6.5, week: 1 }
];

export default function App() {
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  
  // Quản lý trạng thái "Tuần Khô Máo" (Tối đa 2 tuần mỗi đội)
  // Key format: `${teamId}-${week}` -> boolean
  const [khoMaoWeeks, setKhoMaoWeeks] = useState({
    '1-1': false,
    '2-1': false
  });

  // Form nhập liệu
  const [formData, setFormData] = useState({
    teamId: '1',
    member: INITIAL_MEMBERS[1][0],
    type: 'run',
    distance: '',
    pace: '',
    date: new Date().toISOString().split('T')[0],
    week: '1'
  });

  // Xử lý đổi đội trong Form
  const handleTeamChange = (e) => {
    const tId = e.target.value;
    setFormData({
      ...formData,
      teamId: tId,
      member: INITIAL_MEMBERS[tId][0]
    });
  };

  // Bật/Tắt Khô Máo cho Tuần & Đội
  const toggleKhoMao = (teamId, weekNum) => {
    const key = `${teamId}-${weekNum}`;
    const activeInTeam = Object.keys(khoMaoWeeks).filter(
      k => k.startsWith(`${teamId}-`) && khoMaoWeeks[k]
    );

    if (!khoMaoWeeks[key] && activeInTeam.length >= 2) {
      alert(`Đội ${teamId} đã kích hoạt đủ 2 tuần Khô Máo tối đa!`);
      return;
    }

    setKhoMaoWeeks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Thêm Track Mới
  const handleAddTrack = (e) => {
    e.preventDefault();
    const distNum = parseFloat(formData.distance);
    const paceNum = parseFloat(formData.pace);

    if (!distNum || !paceNum) {
      alert("Vui lòng nhập đầy đủ khoảng cách và pace!");
      return;
    }

    // Validation Luật UPRACE OMEGA 6
    if (formData.type === 'swim') {
      if (distNum <= 500) {
        alert("Bơi phải lớn hơn 500m/track!");
        return;
      }
      if (paceNum >= 6) {
        alert("Pace bơi phải nhỏ hơn 6!");
        return;
      }
    } else {
      if (distNum <= 1000) {
        alert("Chạy phải lớn hơn 1000m/track!");
        return;
      }
      if (paceNum >= 12) {
        alert("Pace chạy phải nhỏ hơn 12!");
        return;
      }
    }

    const newTrack = {
      id: Date.now(),
      teamId: parseInt(formData.teamId),
      member: formData.member,
      date: formData.date,
      type: formData.type,
      distance: distNum,
      pace: paceNum,
      week: parseInt(formData.week)
    };

    setTracks([newTrack, ...tracks]);
    setFormData({ ...formData, distance: '', pace: '' });
  };

  // Tính toán Tổng số km quy đổi
  const calculateConvertedKm = (track) => {
    // 1km Bơi = 4km Chạy
    if (track.type === 'swim') {
      return (track.distance / 1000) * 4;
    }
    return track.distance / 1000;
  };

  // Thống kê chi tiết
  const stats = useMemo(() => {
    const teamStats = {
      1: { name: "Đội 1", slogan: "Đã là 1 thì không thể là 2", totalKm: 0, validTracks: 0, members: {} },
      2: { name: "Đội 2", slogan: "Đội 2 thứ 2 thì không ai thứ nhất", totalKm: 0, validTracks: 0, members: {} }
    };

    // Khởi tạo thành viên
    Object.keys(INITIAL_MEMBERS).forEach(tId => {
      INITIAL_MEMBERS[tId].forEach(m => {
        teamStats[tId].members[m] = {
          name: m,
          teamId: parseInt(tId),
          rawRunKm: 0,
          rawSwimKm: 0,
          convertedKm: 0,
          weeklyKm: {}, // tuần -> km
          trackDays: {}, // tuần -> Set các ngày
          penaltyDays: 0
        };
      });
    });

    // Tính toán từng track
    tracks.forEach(track => {
      const converted = calculateConvertedKm(track);
      const mStats = teamStats[track.teamId]?.members[track.member];

      if (mStats) {
        if (track.type === 'run') mStats.rawRunKm += track.distance / 1000;
        if (track.type === 'swim') mStats.rawSwimKm += track.distance / 1000;

        // Lưu km theo tuần
        mStats.weeklyKm[track.week] = (mStats.weeklyKm[track.week] || 0) + converted;

        // Lưu ngày có track
        if (!mStats.trackDays[track.week]) {
          mStats.trackDays[track.week] = new Set();
        }
        mStats.trackDays[track.week].add(track.date);

        teamStats[track.teamId].validTracks += 1;
      }
    });

    // Áp dụng luật Khô Máo & Tính Phạt
    [1, 2].forEach(tId => {
      Object.values(teamStats[tId].members).forEach(m => {
        let totalVal = 0;

        // Tính tổng km có xét trần 50km/tuần
        for (let w = 1; w <= 8; w++) {
          const wKm = m.weeklyKm[w] || 0;
          const isKhoMao = khoMaoWeeks[`${tId}-${w}`];

          if (isKhoMao) {
            totalVal += wKm; // Bào khô máu - Không giới hạn
          } else {
            totalVal += Math.min(wKm, 50); // Tối đa 50km/tuần
          }

          // Tính phạt nếu tuần đó có ít hơn 6 track/ngày khác nhau
          const daysCount = m.trackDays[w] ? m.trackDays[w].size : 0;
          if (daysCount < 6 && w === selectedWeek) {
            m.penaltyDays += (6 - daysCount);
          }
        }

        m.convertedKm = totalVal;
        teamStats[tId].totalKm += totalVal;
      });
    });

    return teamStats;
  }, [tracks, khoMaoWeeks, selectedWeek]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-6 shadow-xl text-center relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 font-black px-4 py-1 rounded-full text-xs uppercase tracking-wider mb-2 shadow-md">
            <Sparkles className="w-4 h-4" /> UPRACE OMEGA MÙA 6
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
            SONG ĐẤU MÙA MƯA GIÓ
          </h1>
          <p className="text-cyan-100 text-sm md:text-base font-semibold mt-1">
            21/09/2026 – 19/11/2026 (8 Tuần) • Khỏe là chính - Hơn thua là mười!
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-8">
        
        {/* THANH SONG ĐẤU (REAL-TIME BATTLE BAR) */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <div className="text-emerald-400 font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>ĐỘI 1: {stats[1].totalKm.toFixed(1)} km</span>
            </div>
            <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300 font-medium">
              VS
            </span>
            <div className="text-amber-400 font-bold flex items-center gap-2">
              <span>ĐỘI 2: {stats[2].totalKm.toFixed(1)} km</span>
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-6 rounded-full overflow-hidden flex p-1 border border-slate-700">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-l-full transition-all duration-500"
              style={{ 
                width: `${(stats[1].totalKm + stats[2].totalKm) > 0 
                  ? (stats[1].totalKm / (stats[1].totalKm + stats[2].totalKm)) * 100 
                  : 50}%` 
              }}
            />
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-r-full transition-all duration-500"
              style={{ 
                width: `${(stats[1].totalKm + stats[2].totalKm) > 0 
                  ? (stats[2].totalKm / (stats[1].totalKm + stats[2].totalKm)) * 100 
                  : 50}%` 
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-center text-xs text-slate-400">
            <div className="italic">"{stats[1].slogan}"</div>
            <div className="italic">"{stats[2].slogan}"</div>
          </div>
        </section>

        {/* CẤU HÌNH TUẦN KHÔ MÁO */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold">
            <Flame className="w-5 h-5" />
            <h2>CẢNH SÁT THU LÊ & QUẢN LÝ TUẦN KHÔ MÁO (BỎ TRẦN 50KM)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(tId => {
              const activeCount = Object.keys(khoMaoWeeks).filter(
                k => k.startsWith(`${tId}-`) && khoMaoWeeks[k]
              ).length;

              return (
                <div key={tId} className="bg-slate-900 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-slate-200">
                      Đội {tId} - Đã dùng: <span className="text-amber-400">{activeCount}/2 tuần</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(wNum => {
                      const isK = khoMaoWeeks[`${tId}-${wNum}`];
                      return (
                        <button
                          key={wNum}
                          onClick={() => toggleKhoMao(tId, wNum)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isK 
                              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          Tuần {wNum} {isK ? '🔥' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FORM NHẬP TRACK */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4 text-cyan-400 font-bold">
            <PlusCircle className="w-5 h-5" />
            <h2>GHI NHẬN TRACK MỚI</h2>
          </div>

          <form onSubmit={handleAddTrack} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Đội</label>
              <select 
                value={formData.teamId} 
                onChange={handleTeamChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
              >
                <option value="1">Đội 1</option>
                <option value="2">Đội 2</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Thành viên</label>
              <select 
                value={formData.member} 
                onChange={(e) => setFormData({ ...formData, member: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
              >
                {INITIAL_MEMBERS[formData.teamId].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Môn</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
              >
                <option value="run">Chạy (&gt;1000m)</option>
                <option value="swim">Bơi (&gt;500m)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Quãng đường (m)</label>
              <input 
                type="number" 
                placeholder="VD: 5000"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Pace</label>
              <input 
                type="number" 
                step="0.1"
                placeholder="VD: 5.5"
                value={formData.pace}
                onChange={(e) => setFormData({ ...formData, pace: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100"
              />
            </div>

            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold p-2.5 rounded-lg text-sm transition-all shadow-lg shadow-cyan-500/20"
              >
                Ghi Nhận Track
              </button>
            </div>
          </form>
        </section>

        {/* BẢNG XẾP HẠNG THÀNH VIÊN */}
        <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-400 font-bold">
              <Award className="w-5 h-5" />
              <h2>BẢNG XẾP HẠNG CÁ NHÂN</h2>
            </div>

            {/* Bộ lọc */}
            <div className="flex flex-wrap items-center gap-3">
              <select 
                value={selectedTeamFilter} 
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              >
                <option value="all">Tất cả đội</option>
                <option value="1">Đội 1</option>
                <option value="2">Đội 2</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="p-3 rounded-l-lg">Hạng</th>
                  <th className="p-3">Thành viên</th>
                  <th className="p-3">Đội</th>
                  <th className="p-3">Chạy (km)</th>
                  <th className="p-3">Bơi (km)</th>
                  <th className="p-3">Quy Đổi (km)</th>
                  <th className="p-3 rounded-r-lg">Trạng thái Phạt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {Object.values(stats)
                  .flatMap(t => Object.values(t.members))
                  .filter(m => selectedTeamFilter === 'all' || m.teamId === parseInt(selectedTeamFilter))
                  .sort((a, b) => b.convertedKm - a.convertedKm)
                  .map((m, idx) => (
                    <tr key={m.name} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        {m.name}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          m.teamId === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          Đội {m.teamId}
                        </span>
                      </td>
                      <td className="p-3">{m.rawRunKm.toFixed(1)} km</td>
                      <td className="p-3">{m.rawSwimKm.toFixed(1)} km</td>
                      <td className="p-3 font-extrabold text-cyan-400">{m.convertedKm.toFixed(1)} km</td>
                      <td className="p-3">
                        {m.penaltyDays > 0 ? (
                          <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded-full font-semibold">
                            Thiếu {m.penaltyDays} ngày (Phạt {(m.penaltyDays * 50).toLocaleString()}k)
                          </span>
                        ) : (
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full font-semibold">
                            Đạt chuẩn 6 track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}
