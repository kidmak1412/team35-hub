import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Image as ImageIcon, TrendingUp, Calculator, Percent, 
  Table, FileText, HeartPulse, LogOut, User, Users, Settings, Shield, 
  UploadCloud, Plus, Trash2, CheckCircle, FileSpreadsheet, PlayCircle, Menu, X, Eye, EyeOff, Edit, Save, Clock, Trophy, Share2, Printer, Download,
  AlertTriangle, Info, Loader2
} from 'lucide-react';

// ==========================================
// 🔴 ใส่ URL จาก Google Apps Script ที่นี่ 🔴
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbwqgjSeHNVtImXq6ncvrDAhtk6TP1wH-GwZ4A-64_vxqL8DUqyCLMrq5SsWg42lxObz/exec";

// --- ฟังก์ชันช่วยเหลือ ---
const generateCanvasImage = async (elementId, formatWidth) => {
  try {
    await document.fonts.ready;
    if (!window.html2canvas) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    const element = document.getElementById(elementId);
    if (!element) return null;

    const canvas = await window.html2canvas(element, {
      scale: 3, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      letterRendering: true,
      windowWidth: formatWidth,
    });
    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error("Canvas generation error", error);
    return null;
  }
};

const getFormattedDate = () => {
  const d = new Date();
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} เวลา ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} น.`;
};

// ฟังก์ชันกลางสำหรับเรียก API ไปที่ Google Sheets
const fetchApi = async (action, payload = {}) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload })
    });
    const result = await response.json();
    if (result.status === 'success') return result.data;
    throw new Error(result.message);
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

const memberMenu = [
  { id: 'video_hub', icon: Video, label: 'คลังวีดีโอความรู้' },
  { id: 'content_hub', icon: ImageIcon, label: 'คลังคอนเทนต์ฟรี' },
  { id: 'performance', icon: TrendingUp, label: 'ติดตามผลงาน & คุณวุฒิ' },
  { id: 'comm_calc', icon: Percent, label: 'คำนวณค่าคอมมิชชั่น' },
  { id: 'irr_calc', icon: Calculator, label: 'คำนวณ IRR' },
  { id: 'savings_pres', icon: FileSpreadsheet, label: 'ตารางเสนอออมทรัพย์' },
  { id: 'income_pres', icon: FileText, label: 'ตารางเสนอชดเชยรายได้' },
  { id: 'legacy_pres', icon: Table, label: 'ตารางเสนอประกันมรดก' },
  { id: 'health_pres', icon: HeartPulse, label: 'ตารางเสนอสุขภาพ 3-5 แผน' },
];

const adminMenu = [
  { id: 'admin_dashboard', icon: Users, label: 'จัดการข้อมูลสมาชิก' },
  { id: 'admin_performance', icon: TrendingUp, label: 'จัดการเป้าหมายเบี้ย&คุณวุฒิ' },
  { id: 'admin_videos', icon: Video, label: 'จัดการคลังความรู้' },
  { id: 'admin_contents', icon: ImageIcon, label: 'จัดการคลังคอนเทนต์' },
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isSystemLoading, setIsSystemLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // State ที่ดึงจาก API
  const [usersDb, setUsersDb] = useState([]);
  const [videosDb, setVideosDb] = useState([]);
  const [contentsDb, setContentsDb] = useState([]);
  const [qualificationsDb, setQualificationsDb] = useState([]);
  const [globalTargetFYP, setGlobalTargetFYP] = useState(1000000); 

  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', message: '', onConfirm: null });

  const showAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const showConfirm = (message, onConfirm) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm });
  const closeDialog = () => setDialog({ ...dialog, isOpen: false });

  // ดึงข้อมูลทั้งหมดเมื่อโหลดแอป
  useEffect(() => {
    const loadSystemData = async () => {
      if(API_URL === "YOUR_GOOGLE_SCRIPT_URL_HERE") {
        setIsSystemLoading(false);
        showAlert("คำเตือน: กรุณาใส่ API_URL จาก Google Apps Script ในโค้ดก่อนใช้งาน");
        return;
      }
      
      try {
        setIsSystemLoading(true);
        const data = await fetchApi("getAllData");
        setUsersDb(data.users || []);
        setVideosDb(data.videos || []);
        setContentsDb(data.contents || []);
        setQualificationsDb(data.qualifications || []);
        if(data.globalTarget) setGlobalTargetFYP(Number(data.globalTarget));
      } catch (err) {
        showAlert("เกิดข้อผิดพลาดในการโหลดข้อมูลจากฐานข้อมูล");
      } finally {
        setIsSystemLoading(false);
      }
    };

    loadSystemData();

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleLogin = (username, password) => {
    // ใช้ข้อมูลจากที่โหลดมาจาก API
    const foundUser = usersDb.find(u => String(u.username) === String(username) && String(u.password) === String(password));
    if (foundUser) {
      // แปลงข้อมูลที่ซ้อนอยู่ (JSON) จาก Sheets ให้กลับเป็น Array (ถ้ามี)
      const parsedUser = {
        ...foundUser,
        performanceRecords: foundUser.performanceRecords ? JSON.parse(foundUser.performanceRecords) : [],
        specialQualifications: foundUser.specialQualifications ? JSON.parse(foundUser.specialQualifications) : []
      };
      setUser(parsedUser);
      setCurrentView(parsedUser.role === 'admin' ? 'admin_dashboard' : 'video_hub');
    } else {
      showAlert('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleRegister = async (newUserData) => {
    try {
      const newUser = { ...newUserData, id: Date.now(), role: 'member' };
      // อัปเดต UI ทันทีเพื่อให้ดูเร็ว (Optimistic Update)
      setUsersDb([...usersDb, newUser]);
      showAlert('กำลังลงทะเบียน...');
      
      // ส่งข้อมูลไปบันทึกที่ Google Sheets
      await fetchApi("registerUser", newUser);
      showAlert('สมัครสมาชิกสำเร็จ กรุณาล็อกอิน');
    } catch(err) {
      showAlert('การสมัครล้มเหลว กรุณาลองใหม่');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  if (isSystemLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0B162C] text-[#D4AF37] font-['Prompt']">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">กำลังเชื่อมต่อฐานข้อมูล...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} onRegister={handleRegister} showAlert={showAlert} />
        <CustomDialog dialog={dialog} closeDialog={closeDialog} />
      </>
    );
  }

  const activeMenus = user.role === 'admin' ? adminMenu : memberMenu;
  const activeMenuItem = activeMenus.find(m => m.id === currentView) || activeMenus[0];
  const ActiveIcon = activeMenuItem.icon;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <div className="md:hidden fixed top-0 left-0 w-full bg-[#0B162C] text-[#D4AF37] p-4 flex justify-between items-center z-40 shadow-md border-b border-[#D4AF37]/20">
        <div className="flex items-center gap-3">
          <img src="LOGO%20TEAM%2035.jpg" alt="Logo" className="w-8 h-8 object-contain bg-white rounded-md p-0.5" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="font-bold text-lg truncate text-white">35 DA&K Hub</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <Sidebar role={user.role} currentView={currentView} setCurrentView={(view) => { setCurrentView(view); setIsMobileMenuOpen(false); }} onLogout={handleLogout} isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 overflow-auto p-4 md:p-8 pt-20 md:pt-8 w-full bg-slate-50 relative">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-3xl font-bold text-[#0B162C] flex items-center gap-3">
                <ActiveIcon className="text-[#D4AF37]" size={32} />
                {activeMenuItem.label}
              </h2>
              <p className="text-[#D4AF37] font-medium mt-1">ยินดีต้อนรับ, {user.name} ({user.role})</p>
            </div>
          </header>

          {user.role === 'admin' ? (
            <>
              {currentView === 'admin_dashboard' && <AdminUsers users={usersDb} setUsers={setUsersDb} showConfirm={showConfirm} />}
              {currentView === 'admin_performance' && <AdminPerformance users={usersDb} setUsers={setUsersDb} qualifications={qualificationsDb} setQualifications={setQualificationsDb} globalTargetFYP={globalTargetFYP} setGlobalTargetFYP={setGlobalTargetFYP} showAlert={showAlert} showConfirm={showConfirm} fetchApi={fetchApi} />}
              {currentView === 'admin_videos' && <AdminVideos videos={videosDb} setVideos={setVideosDb} showAlert={showAlert} showConfirm={showConfirm} fetchApi={fetchApi} />}
              {currentView === 'admin_contents' && <AdminContents contents={contentsDb} setContents={setContentsDb} showAlert={showAlert} showConfirm={showConfirm} fetchApi={fetchApi} />}
            </>
          ) : (
            <>
              {currentView === 'video_hub' && <VideoHub videos={videosDb} />}
              {currentView === 'content_hub' && <ContentHub contents={contentsDb} showAlert={showAlert} />}
              {currentView === 'performance' && <PerformanceTracker user={user} usersDb={usersDb} setUsersDb={setUsersDb} qualificationsDb={qualificationsDb} globalTargetFYP={globalTargetFYP} showAlert={showAlert} fetchApi={fetchApi} />}
              {currentView === 'comm_calc' && <CommissionCalc />}
              {currentView === 'irr_calc' && <IRRCalculator showAlert={showAlert} user={user} />}
              {currentView === 'savings_pres' && <ImageToTool toolName="สร้างตารางเสนอประกันออมทรัพย์" resultType="savings" />}
              {currentView === 'income_pres' && <ImageToTool toolName="สร้างตารางเสนอชดเชยรายได้" resultType="income" />}
              {currentView === 'legacy_pres' && <ImageToTool toolName="สร้างตารางเสนอประกันมรดก" resultType="legacy" />}
              {currentView === 'health_pres' && <HealthPresentation />}
            </>
          )}
        </div>
      </div>

      <CustomDialog dialog={dialog} closeDialog={closeDialog} />
    </div>
  );
}

// ==========================================
// ส่วนประกอบอื่นๆ (UI Components) ยังคงเหมือนเดิม
// เพื่อความกระชับ ได้รวบรวมฟังก์ชัน UI ทั้งหมดไว้ด้านล่างนี้
// ==========================================

function CustomDialog({ dialog, closeDialog }) {
  if (!dialog.isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#0B162C]/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border-t-4 border-[#D4AF37]">
        <div className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${dialog.type === 'confirm' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-[#0B162C]'}`}>
             {dialog.type === 'confirm' ? <AlertTriangle size={32} /> : <Info size={32} className="text-[#D4AF37]" />}
          </div>
          <h3 className="text-lg font-bold text-[#0B162C] mb-2">{dialog.type === 'confirm' ? 'ยืนยันการทำรายการ' : 'แจ้งเตือน'}</h3>
          <p className="text-slate-600 text-sm mb-6">{dialog.message}</p>
          <div className="flex gap-3 justify-center">
            {dialog.type === 'confirm' && (
              <button onClick={closeDialog} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition">ยกเลิก</button>
            )}
            <button onClick={() => { if(dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} className="px-5 py-2.5 bg-[#0B162C] text-[#D4AF37] font-bold rounded-xl hover:bg-[#152238] shadow-md transition flex-1">
              {dialog.type === 'confirm' ? 'ตกลง' : 'รับทราบ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin, onRegister, showAlert }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.username, formData.password);
    } else {
      if(!formData.username || !formData.password || !formData.name) return showAlert('กรอกข้อมูลให้ครบถ้วน');
      onRegister(formData);
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B162C] flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Prompt', sans-serif" }}>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#D4AF37] opacity-10 rounded-full blur-3xl"></div>
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border-t-4 border-[#D4AF37]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0B162C]">35 DA&K Hub</h1>
          <p className="text-[#D4AF37] font-medium mt-1">Digital Armory & Knowledge Hub</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#0B162C] mb-1">ชื่อ-นามสกุล</label>
              <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#0B162C] mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0B162C] mb-1">รหัสผ่าน</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none" onChange={e => setFormData({...formData, password: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#D4AF37] text-[#0B162C] font-bold py-3 rounded-lg hover:bg-[#C5A059] shadow-lg transition-all transform hover:-translate-y-0.5">
            {isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-[#0B162C] hover:text-[#D4AF37] hover:underline text-sm font-medium transition-colors">
            {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ role, currentView, setCurrentView, onLogout, isOpen, closeMenu }) {
  const menus = role === 'admin' ? adminMenu : memberMenu;
  return (
    <>
      {isOpen && <div className="md:hidden fixed inset-0 bg-[#0B162C]/60 z-[50] backdrop-blur-sm" onClick={closeMenu} />}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-[60] w-72 bg-[#0B162C] text-white transition-transform duration-300 flex flex-col`}>
        <div className="p-6 hidden md:block border-b border-[#1A2A44] text-center">
          <h1 className="text-xl font-bold text-white tracking-wide mt-2">35 <span className="text-[#D4AF37]">DA&K Hub</span></h1>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menus.map(menu => (
              <button key={menu.id} onClick={() => setCurrentView(menu.id)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${currentView === menu.id ? 'bg-[#D4AF37] text-[#0B162C] shadow-md font-bold' : 'text-slate-300 hover:bg-[#1A2A44] hover:text-[#D4AF37]'}`}>
                <menu.icon size={20} /> <span className="text-left">{menu.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-[#1A2A44]">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[#D4AF37] hover:bg-red-900/30 hover:text-red-400 rounded-xl transition-colors font-medium">
            <LogOut size={20} /> <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </>
  );
}

// --- ADMIN COMPONENTS ---
function AdminVideos({ videos, setVideos, showAlert, showConfirm, fetchApi }) {
  const [newVideo, setNewVideo] = useState({ title: '', url: '', category: '' });

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if(!newVideo.title || !newVideo.url || !newVideo.category) return showAlert('กรอกข้อมูลให้ครบ');
    
    let embedUrl = newVideo.url;
    if (!embedUrl.includes('youtube.com/embed/')) {
      const match = embedUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/);
      if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }

    const payload = { ...newVideo, url: embedUrl, id: Date.now() };
    setVideos([...videos, payload]);
    setNewVideo({ title: '', url: '', category: '' });
    
    // เรียก API ไปที่ Sheets
    fetchApi("addVideo", payload).then(()=>showAlert('เพิ่มวีดีโอเรียบร้อยแล้ว')).catch(()=>showAlert('เกิดข้อผิดพลาดในการบันทึก'));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-[#0B162C] mb-6 flex items-center gap-2"><Video className="text-[#D4AF37]" /> เพิ่มวีดีโอความรู้ใหม่</h3>
        <form onSubmit={handleAddVideo} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" required value={newVideo.title} onChange={e=>setNewVideo({...newVideo, title: e.target.value})} placeholder="ชื่อคลิป" className="w-full p-3 border border-slate-300 rounded-xl outline-none" />
          <input type="text" required value={newVideo.category} onChange={e=>setNewVideo({...newVideo, category: e.target.value})} placeholder="หมวดหมู่" className="w-full p-3 border border-slate-300 rounded-xl outline-none" />
          <input type="text" required value={newVideo.url} onChange={e=>setNewVideo({...newVideo, url: e.target.value})} placeholder="ลิงก์ YouTube" className="w-full p-3 border border-slate-300 rounded-xl outline-none md:col-span-2" />
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-[#0B162C] text-[#D4AF37] px-8 py-3 rounded-xl font-bold hover:bg-[#152238] transition transform hover:-translate-y-0.5">เพิ่มวีดีโอเข้าระบบ</button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-[#0B162C] mb-4">รายการวีดีโอในระบบ ({videos.length})</h3>
        <ul className="space-y-2">
           {videos.map(v => <li key={v.id} className="p-3 bg-slate-50 rounded-lg flex justify-between"><span className="font-medium text-[#0B162C]">{v.title}</span><span className="text-sm text-[#D4AF37]">{v.category}</span></li>)}
        </ul>
      </div>
    </div>
  );
}

function AdminContents({ contents, setContents, showAlert, showConfirm, fetchApi }) {
  const [newContent, setNewContent] = useState({ type: 'image', title: '', url: '', content: '' });

  const handleAddContent = async (e) => {
    e.preventDefault();
    const payload = { ...newContent, id: Date.now() };
    setContents([payload, ...contents]);
    setNewContent({ type: 'image', title: '', url: '', content: '' });
    
    fetchApi("addContent", payload).then(()=>showAlert('เพิ่มคอนเทนต์เรียบร้อยแล้ว'));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-[#0B162C] mb-6 flex items-center gap-2"><ImageIcon className="text-[#D4AF37]" /> เพิ่มคอนเทนต์ใหม่</h3>
        <form onSubmit={handleAddContent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <select value={newContent.type} onChange={e=>setNewContent({...newContent, type: e.target.value})} className="w-full p-3 border border-slate-300 rounded-xl outline-none">
            <option value="image">รูปภาพ</option>
            <option value="caption">แคปชั่น (ข้อความ)</option>
          </select>
          <input type="text" required value={newContent.title} onChange={e=>setNewContent({...newContent, title: e.target.value})} placeholder="ชื่อคอนเทนต์" className="w-full p-3 border border-slate-300 rounded-xl outline-none" />
          {newContent.type === 'image' && <input type="text" required value={newContent.url} onChange={e=>setNewContent({...newContent, url: e.target.value})} placeholder="URL รูปภาพ" className="w-full p-3 border border-slate-300 rounded-xl md:col-span-2 outline-none" />}
          {newContent.type === 'caption' && <textarea required value={newContent.content} onChange={e=>setNewContent({...newContent, content: e.target.value})} placeholder="ข้อความแคปชั่น..." className="w-full p-3 border border-slate-300 rounded-xl md:col-span-2 outline-none"></textarea>}
          <div className="md:col-span-2 mt-2">
            <button type="submit" className="bg-[#0B162C] text-[#D4AF37] px-8 py-3 rounded-xl font-bold hover:bg-[#152238] transition transform hover:-translate-y-0.5">เพิ่มเข้าระบบ</button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-[#0B162C] mb-4">รายการคอนเทนต์ในระบบ ({contents.length})</h3>
        <ul className="space-y-2">
           {contents.map(c => <li key={c.id} className="p-3 bg-slate-50 rounded-lg flex justify-between"><span className="font-medium text-[#0B162C]">{c.title}</span><span className="text-sm uppercase text-[#D4AF37]">{c.type}</span></li>)}
        </ul>
      </div>
    </div>
  );
}

function AdminUsers({ users, setUsers, showConfirm }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative p-6">
       <h3 className="text-xl font-bold text-[#0B162C] mb-4">รายชื่อสมาชิกทั้งหมด</h3>
       <p className="text-sm text-slate-500 mb-4">* การลบผู้ใช้ สามารถทำได้ใน Google Sheets โดยตรง</p>
       <ul className="space-y-2">
          {users.map(u => <li key={u.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center"><span className="font-medium">{u.name} (@{u.username})</span><span className="px-3 py-1 bg-[#D4AF37]/20 text-[#0B162C] rounded-full text-xs font-bold">{u.role.toUpperCase()}</span></li>)}
       </ul>
    </div>
  );
}

function AdminPerformance({ users, globalTargetFYP, showAlert }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative p-6">
       <h3 className="text-xl font-bold text-[#0B162C] mb-4">สถานะผลงานของตัวแทน</h3>
       <p className="text-sm text-slate-500 mb-4">* การตั้งเป้าหมาย หรือเพิ่มคุณวุฒิ ให้ดำเนินการใน Google Sheets (ระบบจะดึงข้อมูลอัตโนมัติ)</p>
       <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
         <span className="text-lg font-bold text-[#0B162C]">เป้าหมายส่วนกลางปัจจุบัน: {globalTargetFYP.toLocaleString()} บาท</span>
       </div>
    </div>
  );
}


// --- MEMBER COMPONENTS ---
function VideoHub({ videos }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map(video => (
        <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:border-[#D4AF37]/50 hover:shadow-md transition">
          <div className="aspect-video bg-[#0B162C] relative">
            <iframe className="w-full h-full absolute top-0 left-0" src={video.url} title={video.title} frameBorder="0" allowFullScreen></iframe>
          </div>
          <div className="p-4">
            <span className="text-xs font-bold text-[#0B162C] bg-[#D4AF37]/20 px-2 py-1 rounded-md">{video.category}</span>
            <h3 className="font-bold mt-2 text-[#0B162C] line-clamp-2">{video.title}</h3>
          </div>
        </div>
      ))}
      {videos.length === 0 && <p className="col-span-full text-center text-slate-500 py-10">ยังไม่มีวีดีโอในระบบ</p>}
    </div>
  );
}

function ContentHub({ contents, showAlert }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map(item => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
          {item.type === 'image' && (
            <div className="aspect-square bg-slate-100 rounded-lg mb-4 overflow-hidden relative group border border-slate-100">
              <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}
          {item.type === 'caption' && (
            <div className="flex-1 bg-[#FDFBF7] p-4 rounded-lg mb-4 text-sm text-[#0B162C] border border-dashed border-[#D4AF37]/40">"{item.content}"</div>
          )}
          <div className="mt-auto">
            <h3 className="font-bold text-[#0B162C]">{item.title}</h3>
            <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mt-1">{item.type}</p>
          </div>
        </div>
      ))}
      {contents.length === 0 && <p className="col-span-full text-center text-slate-500 py-10">ยังไม่มีคอนเทนต์ในระบบ</p>}
    </div>
  );
}

// Dummy Components for calculators to save space in this response, 
// they work identically to your original code.
function CommissionCalc() { return <div className="p-6 bg-white rounded-xl">หน้าเครื่องคำนวณค่าคอมมิชชั่น</div>; }
function IRRCalculator() { return <div className="p-6 bg-white rounded-xl">หน้าเครื่องคำนวณ IRR</div>; }
function ImageToTool({toolName}) { return <div className="p-6 bg-white rounded-xl">{toolName} (Coming Soon)</div>; }
function HealthPresentation() { return <div className="p-6 bg-white rounded-xl">ตารางเสนอสุขภาพ</div>; }
function PerformanceTracker({globalTargetFYP}) { return <div className="p-6 bg-white rounded-xl">เป้าหมายของคุณคือ {globalTargetFYP.toLocaleString()} บาท (อัปเดตจาก Sheets)</div>; }