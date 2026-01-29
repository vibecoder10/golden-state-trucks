import React, { useState, useEffect } from 'react';
import {
    Truck, Calendar, Phone, Clock, X, ArrowRight, CheckCircle2, Zap
} from 'lucide-react';

// Google Calendar Appointment Scheduling URL
const GOOGLE_CALENDAR_SCHEDULING_URL = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0l1gicrGJxuYcCdguAEZwNt8eoj_hvPADgW25I7K-Y0eTNs9hWYsi1cHc4ZNPVZWlLBDaKEYyq?gv=true';

const App = () => {
    const [scrolled, setScrolled] = useState(false);
    const [view, setView] = useState('landing');
    const [loading, setLoading] = useState(false);

    // Environment Config - must be defined before useEffects that use it
    const API_URL = import.meta.env.PROD ? '' : 'http://localhost:4242';

    // Check for Stripe Success redirect (for Quick Charge payments)
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            setView('success');
        }
        if (query.get('canceled')) {
            alert('Payment canceled -- please try again.');
        }
    }, []);

    // Scroll to top when view changes
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 50);
    }, [view]);

    // Quick Charge POS state
    const [quickChargeData, setQuickChargeData] = useState({
        customerName: '',
        truckCount: '1',
        notes: ''
    });


    const pricingPlans = [
        { title: "Owner Operator", price: "199", features: ["1 Mobile Test", "CARB Upload", "DMV Certificate", "24hr Processing"], popular: false },
        { title: "Small Fleet", price: "175", features: ["2-10 Units", "Priority Slot", "Cloud Archive", "Compliance Alerts"], popular: true },
        { title: "Enterprise", price: "145", features: ["10+ Units", "Volume Discount", "Custom Scheduling", "Dedicated Rep"], popular: false }
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate price per truck based on quantity tiers
    const getPricePerTruck = (count) => {
        const numTrucks = parseInt(count) || 1;
        if (numTrucks === 1) return 199;
        if (numTrucks >= 2 && numTrucks <= 10) return 175;
        return 145; // 11+ trucks
    };

    // Quick Charge POS - direct checkout without scheduling
    const handleQuickCharge = async () => {
        if (!quickChargeData.customerName || !quickChargeData.truckCount) {
            alert('Please enter customer name and truck count');
            return;
        }

        setLoading(true);
        const truckCount = parseInt(quickChargeData.truckCount) || 1;
        const pricePerTruck = getPricePerTruck(truckCount);
        const totalPrice = truckCount * pricePerTruck;

        const payload = {
            name: quickChargeData.customerName,
            truckCount,
            pricePerTruck,
            totalPrice,
            location: 'On-Site / Quick Charge',
            memo: quickChargeData.notes,
            isQuickCharge: true
        };

        try {
            const response = await fetch(`${API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    alert('Error: No checkout URL returned.');
                }
            } else {
                alert('Server error. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('Quick charge error. Check console.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-emerald-100">

            {/* Header */}
            <div className="fixed top-0 w-full z-50">


                <nav className={`transition-all duration-500 ${scrolled || view !== 'landing' ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'}`}>
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
                            <img src="/logo.jpg" alt="Golden State Clean Truck Check" className={`transition-all duration-300 w-auto object-contain ${scrolled || view !== 'landing' ? 'h-12 opacity-100' : 'h-0 opacity-0 w-0'}`} />
                        </div>

                        <div className="flex items-center gap-4">
                            <button onClick={() => setView('quickcharge')} className="flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30">
                                <Zap size={14} className="md:w-4 md:h-4" />
                                <span className="hidden sm:inline">Quick Charge</span>
                                <span className="sm:hidden">Pay</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            <main className="pt-28">
                {view === 'landing' && (
                    <>
                        {/* Hero */}
                        <header className="pt-10 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
                            <div className="lg:col-span-7">
                                <div className="flex flex-col items-center lg:items-start mb-8">
                                    <img src="/logo.jpg" alt="Golden State Clean Truck Check" className="h-48 md:h-72 w-auto object-contain mb-4" />
                                    <div className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200">Official CARB Partner</div>
                                </div>

                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 text-slate-950">
                                    CARB Compliance, <br />
                                    <span className="text-emerald-600">Simplified.</span>
                                </h1>

                                <p className="text-xl text-slate-500 font-medium max-w-lg mb-10 leading-relaxed">
                                    Stop losing hauls. We provide elite mobile emissions testing at your yard—on your schedule. Guaranteed 24-hour certificate upload.
                                </p>

                                {/* Rapid Response List */}
                                <div className="flex flex-col gap-3 mb-12">
                                    <p className="text-sm font-black uppercase tracking-widest text-slate-900">Trucks 2013 and Newer</p>
                                    {['Instant OBD Uploads', 'Heavy-Duty Opacity Testing', 'DMV Registration Support'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 font-bold text-slate-700">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 size={14} strokeWidth={3} />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => setView('booking')} className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3 transform hover:-translate-y-1">
                                        Schedule Inspection <ArrowRight size={20} />
                                    </button>
                                    <a href="tel:4154167565" className="bg-white border-2 border-slate-100 px-8 py-5 rounded-2xl font-black text-slate-900 uppercase tracking-widest hover:border-slate-300 transition-all flex items-center gap-3">
                                        <Phone size={18} className="text-emerald-600" /> Dispatch
                                    </a>
                                </div>
                            </div>

                            {/* Eligibility / Booking Card */}
                            <div className="lg:col-span-5 relative">
                                <div className="bg-slate-950 text-white rounded-[40px] shadow-2xl p-10 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Truck size={200} />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-900/50">
                                            <Clock size={32} className="text-white" />
                                        </div>
                                        <h4 className="text-3xl font-black mb-2 tracking-tight">Zero Downtime.</h4>
                                        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                                            We work when you don't. Weekend and after-hours appointments available to keep your fleet moving.
                                        </p>

                                        <button onClick={() => { setView('booking'); }} className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black hover:bg-emerald-50 transition-all flex justify-center items-center gap-2">
                                            Book Now <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Pricing Section */}
                        <section className="py-24 bg-[#F8FAFC] border-y border-slate-200 px-6">
                            <div className="max-w-7xl mx-auto">
                                <div className="text-center mb-16">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-slate-950">Transparent Pricing.</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">Mobilization Fee included for Bay Area</p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                    {pricingPlans.map((plan, i) => (
                                        <div key={i} className={`p-10 rounded-[40px] border-2 transition-all relative flex flex-col ${plan.popular ? 'border-emerald-600 bg-white shadow-2xl shadow-emerald-100 scale-105 z-10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                            {plan.popular && <div className="absolute top-0 center text-center w-full left-0 -translate-y-1/2"><span className="bg-emerald-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</span></div>}

                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">{plan.title}</h4>
                                            <div className="flex items-baseline gap-1 mb-2">
                                                <span className="text-5xl font-black text-slate-900">${plan.price}</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 mb-8">Per Unit / Inspection</p>

                                            <ul className="space-y-4 mb-10 flex-grow">
                                                {plan.features.map((f, j) => (
                                                    <li key={j} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                onClick={() => { setFormData({ ...formData, selectedPlan: plan }); setView('booking'); }}
                                                className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${plan.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                            >
                                                Select Plan
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {view === 'booking' && (
                    <section className="pt-10 pb-24 px-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6">
                        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
                            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black">Book Inspection</h2>
                                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Select a time that works for you</p>
                                </div>
                                <button onClick={() => setView('landing')} className="text-slate-400 hover:text-white transition-colors"><X /></button>
                            </div>

                            {/* Google Calendar Appointment Scheduling Embed */}
                            <div className="p-6">
                                <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Real-time Availability</p>
                                            <p className="text-xs text-slate-600 mt-1">Pick a date and time below. Your appointment will be instantly confirmed and synced to our calendar.</p>
                                        </div>
                                    </div>
                                </div>

                                <iframe
                                    src={GOOGLE_CALENDAR_SCHEDULING_URL}
                                    style={{ border: 0 }}
                                    width="100%"
                                    height="700"
                                    frameBorder="0"
                                    className="rounded-2xl"
                                    title="Book an appointment"
                                />

                                <div className="mt-6 text-center">
                                    <p className="text-xs text-slate-500 font-medium mb-4">
                                        After booking, you'll receive a confirmation email with all the details.
                                    </p>
                                    <button onClick={() => setView('landing')} className="text-emerald-600 font-bold text-sm hover:underline">
                                        Back to Home
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Quick Charge POS View */}
                {view === 'quickcharge' && (
                    <section className="pt-24 pb-24 px-6 min-h-screen">
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Zap size={32} />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">Quick Charge</h2>
                                <p className="text-slate-500 text-sm mt-2">Point of Sale - No scheduling required</p>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter customer name"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-base"
                                        value={quickChargeData.customerName}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, customerName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Number of Trucks</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-base"
                                        value={quickChargeData.truckCount}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, truckCount: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="VIN, plate, or other notes"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none font-bold text-sm"
                                        value={quickChargeData.notes}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, notes: e.target.value })}
                                    />
                                </div>

                                {/* Price Summary */}
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-slate-600">
                                            {quickChargeData.truckCount || 1} truck{parseInt(quickChargeData.truckCount) > 1 ? 's' : ''} × ${getPricePerTruck(quickChargeData.truckCount)}/truck
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-slate-900">Total</span>
                                        <span className="text-3xl font-black text-amber-600">
                                            ${(parseInt(quickChargeData.truckCount) || 1) * getPricePerTruck(quickChargeData.truckCount)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleQuickCharge}
                                    disabled={loading || !quickChargeData.customerName}
                                    className="w-full bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? 'Processing...' : 'Charge Now'}
                                    <ArrowRight size={18} />
                                </button>

                                <button onClick={() => setView('landing')} className="w-full text-center text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                                    ← Back to Home
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {view === 'success' && (
                    <section className="pt-24 pb-24 px-6 text-center animate-in zoom-in-95">
                        <div className="max-w-xl mx-auto">
                            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200"><CheckCircle2 size={48} /></div>
                            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-none">Payment Complete!</h2>
                            <p className="text-lg text-slate-500 font-medium mb-10 leading-relaxed">Thank you for your payment. Your transaction has been processed successfully.</p>
                            <div className="bg-white border border-slate-100 p-10 rounded-[48px] text-left mb-10 shadow-xl relative overflow-hidden">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">What Happens Next</h4>
                                <ul className="space-y-6">
                                    <li className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                                        <p className="text-xs font-bold text-slate-700">A receipt has been sent to your email address.</p>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                                        <p className="text-xs font-bold text-slate-700">Our team will process your inspection and upload results within 24 hours.</p>
                                    </li>
                                    <li className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                                        <p className="text-xs font-bold text-slate-700">You'll receive your CARB compliance certificate via email.</p>
                                    </li>
                                </ul>
                            </div>
                            <button onClick={() => setView('landing')} className="text-emerald-600 font-black uppercase text-[10px] tracking-widest hover:tracking-[0.2em] transition-all">Back to Home</button>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white py-24 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Truck size={20} /></div>
                            <span className="text-xl font-black tracking-tighter uppercase">GSCTC</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">Bay Area Clean Truck Check Specialists</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">415.416.7565</p>
                        <p className="text-xs font-bold text-slate-500 mt-1">Goldenstatectc@gmail.com</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Open 7 Days — Mobile Dispatch</p>
                    </div>
                </div>
            </footer>

            <style>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 30s linear infinite; }
        `}</style>
        </div>
    );
};

export default App;
