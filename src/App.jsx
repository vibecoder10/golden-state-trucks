import React, { useState, useEffect } from 'react';
import {
    Truck, Calendar, Phone, Clock, X, ArrowRight, CheckCircle2, Zap, Search, MapPin
} from 'lucide-react';
import { mapData } from './MapData';

// --- ZIP CODE DATABASE (Service Area: Peninsula, East Bay, South Bay) ---
const BAY_AREA_ZIPS = {
    'Alameda': ['94501', '94502', '94706', '94710', '94702', '94703', '94704', '94705', '94707', '94708', '94709', '94720', '94546', '94552', '94568', '94808', '94662', '94536', '94537', '94538', '94539', '94555', '94540', '94541', '94542', '94543', '94544', '94545', '94557', '94550', '94551', '94560', '94601', '94602', '94603', '94605', '94606', '94607', '94610', '94611', '94612', '94613', '94619', '94621', '94618', '94620', '94566', '94588', '94577', '94578', '94580', '94586', '94587'],
    'Contra Costa': ['94507', '94509', '94531', '94565', '94511', '94506', '94513', '94516', '94517', '94520', '94518', '94519', '94521', '94523', '94525', '94526', '94528', '94505', '94514', '94530', '94803', '94547', '94549', '94553', '94556', '94561', '94563', '94564', '94801', '94804', '94805', '94806', '94850', '94595', '94596', '94597', '94598', '94582', '94583'],
    'San Francisco': ['94101', '94102', '94103', '94104', '94105', '94106', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94119', '94120', '94121', '94122', '94123', '94124', '94126', '94127', '94129', '94130', '94131', '94132', '94133', '94134', '94135', '94136', '94137', '94138', '94139', '94140', '94141', '94142', '94143', '94144', '94145', '94146', '94147', '94150', '94151', '94152', '94153', '94154', '94155', '94156', '94157', '94158', '94159', '94160', '94161', '94162', '94163', '94164', '94165', '94166', '94167', '94168', '94169', '94170', '94171', '94172', '94175', '94177', '94188', '94199'],
    'San Mateo': ['94027', '94011', '94014', '94030', '94028', '94062', '94019', '94010', '94044', '94080', '94002', '94003', '94005', '94012', '94013', '94015', '94016', '94017', '94018', '94020', '94021', '94025', '94026', '94029', '94031', '94037', '94038', '94045', '94059', '94060', '94061', '94063', '94064', '94065', '94066', '94067', '94070', '94071', '94074', '94083', '94096', '94098', '94099', '94125', '94128', '94307', '94401', '94402', '94403', '94404', '94405', '94406', '94407', '94408', '94409', '94497', '95006'],
    'Santa Clara': ['94022', '94024', '94035', '94040', '94041', '94043', '94085', '94086', '94087', '94089', '94090', '94301', '94302', '94303', '94304', '94305', '94306', '94308', '94309', '94310', '95002', '95008', '95009', '95011', '95013', '95014', '95015', '95020', '95021', '95023', '95026', '95030', '95031', '95032', '95033', '95035', '95036', '95037', '95038', '95042', '95044', '95046', '95050', '95051', '95053', '95054', '95055', '95056', '95070', '95071', '95101', '95102', '95110', '95111', '95112', '95113', '95114', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95137', '95138', '95139', '95140', '95141', '95142', '95148', '95156', '95157', '95158', '95159', '95160', '95161', '95164', '95170', '95171', '95172', '95173', '95190', '95191', '95192', '95193', '95194', '95196'],
};

const getCountyFromZip = (zip) => {
    for (const [county, zips] of Object.entries(BAY_AREA_ZIPS)) {
        if (zips.includes(zip)) return county;
    }
    return null;
};

// County Service Schedules
const COUNTY_SCHEDULE = {
    'San Francisco': ['Mon'],
    'San Mateo': ['Tue', 'Sat'],
    'Santa Clara': ['Wed', 'Sat'],
    'Alameda': ['Thu', 'Sun'],
    'Contra Costa': ['Fri', 'Sun']
};

const COUNTY_SCHEDULE_DISPLAY = {
    'San Francisco': 'Mondays',
    'San Mateo': 'Tuesdays & Saturdays',
    'Santa Clara': 'Wednesdays & Saturdays',
    'Alameda': 'Thursdays & Sundays',
    'Contra Costa': 'Fridays & Sundays'
};

// Available time slots (90-minute appointments)
const TIME_SLOTS = ['7:00 AM', '8:30 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

// BayAreaMap: Interactive Map Component
const BayAreaMap = ({ selectedCounty, onSelect }) => {
    const getFill = (name) => {
        if (selectedCounty === name) return 'fill-slate-900';
        const colors = {
            'Contra Costa': '#F97316', 'Alameda': '#F97316',
            'San Francisco': '#DC2626',
            'San Mateo': '#DB2777',
            'Santa Clara': '#16A34A',
        };
        return colors[name] || '#CBD5E1';
    };

    return (
        <div className="w-full aspect-[4/3] md:aspect-[3/4] relative bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-white shadow-xl md:shadow-2xl">
            <svg viewBox="-392 -775 1812 2411" className="w-full h-full">
                {mapData.context && Object.entries(mapData.context).map(([name, d]) => (
                    <path key={name} d={d} className="fill-slate-200 stroke-white stroke-[3]" />
                ))}
                {mapData.bayArea && Object.entries(mapData.bayArea).map(([name, d]) => {
                    const isSelected = selectedCounty === name;
                    return (
                        <g key={name} onClick={() => onSelect(name)} className="cursor-pointer group">
                            <path
                                d={d}
                                fill={getFill(name)}
                                className={`stroke-white stroke-[4] transition-all duration-300 ${isSelected ? 'brightness-75' : 'hover:brightness-90 hover:scale-[1.01] origin-center'}`}
                            />
                        </g>
                    );
                })}
            </svg>
            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-white/90 backdrop-blur px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[9px] font-bold shadow-sm border border-slate-100 uppercase tracking-widest text-slate-400 pointer-events-none">
                Tap to Select
            </div>
        </div>
    );
};

const App = () => {
    const [scrolled, setScrolled] = useState(false);
    const [view, setView] = useState('landing');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [calendarDates, setCalendarDates] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState('');
    const [busySlots, setBusySlots] = useState([]);

    // Environment Config
    const API_URL = import.meta.env.PROD ? '' : 'http://localhost:4242';

    // Check for Stripe Success redirect
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            const sessionId = query.get('session_id');
            if (sessionId) {
                // Verify and sync to calendar
                fetch(`${API_URL}/verify-booking`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log('Calendar Sync:', data);
                        if (data.status === 'success' && data.booking) {
                            setFormData(prev => ({
                                ...prev,
                                selectedDate: data.booking.date,
                                selectedTime: data.booking.time,
                                name: data.booking.name
                            }));
                        }
                        setView('success');
                    })
                    .catch(err => {
                        console.error('Sync Error', err);
                        setView('success');
                    });
            } else {
                setView('success');
            }
        }
        if (query.get('canceled')) {
            alert('Payment canceled -- please try again.');
        }
    }, []);

    // Scroll to top when view or step changes
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 50);
    }, [view, step]);

    // Booking form state
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        fleetSize: '',
        truckCount: '',
        location: '',
        zipCode: '',
        county: '',
        selectedDate: '',
        selectedTime: '',
        selectedPlan: null,
        memo: ''
    });

    // Quick Charge POS state
    const [quickChargeData, setQuickChargeData] = useState({
        customerName: '',
        truckCount: '1',
        notes: ''
    });

    // Auto-Select County on Zip Change
    useEffect(() => {
        if (formData.zipCode && formData.zipCode.length === 5) {
            const county = getCountyFromZip(formData.zipCode);
            if (county) {
                setFormData(prev => ({ ...prev, county }));
            }
        }
    }, [formData.zipCode]);

    // Generate calendar dates based on county
    useEffect(() => {
        const today = new Date();
        const dates = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        setCalendarMonth(`${monthNames[today.getMonth()]} ${today.getFullYear()}`);

        for (let i = 0; i < 28; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i + 1);

            const dayNameFull = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const monthStr = monthNames[date.getMonth()];
            const fullDateStr = `${monthStr} ${dayNum}`;

            // Filter by County Schedule
            const allowedDays = COUNTY_SCHEDULE[formData.county] || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const isAllowed = allowedDays.includes(dayNameFull);

            dates.push({
                day: dayNum,
                weekday: dayNameFull.charAt(0),
                weekdayFull: dayNameFull,
                fullDate: fullDateStr,
                disabled: !isAllowed
            });
        }

        // Add padding for grid alignment
        const firstDayIndex = new Date(today);
        firstDayIndex.setDate(today.getDate() + 1);
        const paddingCount = firstDayIndex.getDay();
        const padding = Array(paddingCount).fill(null);

        setCalendarDates([...padding, ...dates]);
    }, [formData.county]);

    // Fetch busy slots when date changes
    useEffect(() => {
        if (!formData.selectedDate) return;

        const year = new Date().getFullYear();
        const queryDate = `${formData.selectedDate} ${year}`;

        fetch(`${API_URL}/check-availability?date=${queryDate}`)
            .then(res => res.json())
            .then(data => {
                if (data.busy) setBusySlots(data.busy);
            })
            .catch(console.error);
    }, [formData.selectedDate]);

    // Check if a time slot is busy
    const isSlotBusy = (timeStr) => {
        if (busySlots.length === 0) return false;

        const year = new Date().getFullYear();
        const dateStr = `${formData.selectedDate} ${year} ${timeStr}`;
        const slotStart = new Date(dateStr).getTime();
        const slotEnd = slotStart + (90 * 60 * 1000);

        return busySlots.some(slot => {
            const busyStart = new Date(slot.start).getTime();
            const busyEnd = new Date(slot.end).getTime();
            return (slotStart < busyEnd) && (slotEnd > busyStart);
        });
    };

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

    const getPricePerTruck = (count) => {
        const numTrucks = parseInt(count) || 1;
        if (numTrucks === 1) return 199;
        if (numTrucks >= 2 && numTrucks <= 10) return 175;
        return 145;
    };

    const calculateTotal = () => {
        const count = parseInt(formData.truckCount) || 1;
        return count * getPricePerTruck(count);
    };

    // Handle final booking with Stripe payment
    const handleFinalBooking = async () => {
        setLoading(true);

        const truckCount = parseInt(formData.truckCount) || 1;
        const pricePerTruck = getPricePerTruck(truckCount);
        const totalPrice = truckCount * pricePerTruck;

        const payload = {
            ...formData,
            truckCount,
            pricePerTruck,
            totalPrice
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
                const errorText = await response.text();
                alert(`Server Error: ${errorText}`);
            }
        } catch (e) {
            console.error(e);
            alert('Booking error. Please try again.');
        }
        setLoading(false);
    };

    // Quick Charge POS
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
                }
            } else {
                alert('Server error. Please try again.');
            }
        } catch (e) {
            console.error(e);
            alert('Quick charge error.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-emerald-100">

            {/* Header */}
            <div className="fixed top-0 w-full z-50">
                <nav className={`transition-all duration-500 ${scrolled || view !== 'landing' ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 py-2 md:py-3' : 'bg-transparent py-3 md:py-5'}`}>
                    <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('landing'); setStep(1); }}>
                            <img src="/logo.jpg" alt="Golden State Clean Truck Check" className={`transition-all duration-300 w-auto object-contain ${scrolled || view !== 'landing' ? 'h-10 md:h-12 opacity-100' : 'h-0 opacity-0 w-0'}`} />
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                            <button onClick={() => setView('quickcharge')} className="flex items-center gap-1.5 md:gap-2 bg-amber-500 text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-bold text-xs md:text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30">
                                <Zap size={14} />
                                <span className="hidden sm:inline">Quick Charge</span>
                                <span className="sm:hidden">Pay</span>
                            </button>
                        </div>
                    </div>
                </nav>
            </div>

            <main className="pt-20 md:pt-28">
                {view === 'landing' && (
                    <>
                        {/* Hero */}
                        <header className="pt-6 md:pt-10 pb-12 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 md:gap-16 items-center">
                            <div className="lg:col-span-7">
                                <div className="flex flex-col items-center lg:items-start mb-6 md:mb-8">
                                    <img src="/logo.jpg" alt="Golden State Clean Truck Check" className="h-32 md:h-72 w-auto object-contain mb-3 md:mb-4" />
                                    <div className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-slate-900 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] shadow-xl">Official CARB Partner</div>
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-4 md:mb-6 text-slate-950 text-center lg:text-left">
                                    CARB Compliance, <br />
                                    <span className="text-emerald-600">Simplified.</span>
                                </h1>

                                <p className="text-base md:text-xl text-slate-500 font-medium max-w-lg mb-6 md:mb-10 leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
                                    Mobile emissions testing at your yard—on your schedule. 24-hour certificate upload guaranteed.
                                </p>

                                {/* Features */}
                                <div className="flex flex-col gap-2 md:gap-3 mb-8 md:mb-12">
                                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-900 text-center lg:text-left">Trucks 2013 and Newer</p>
                                    {['Instant OBD Uploads', 'Heavy-Duty Opacity Testing', 'DMV Registration Support'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 md:gap-3 font-bold text-slate-700 text-sm md:text-base justify-center lg:justify-start">
                                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <CheckCircle2 size={12} strokeWidth={3} />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                                    <button onClick={() => setView('booking')} className="bg-emerald-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
                                        Schedule Inspection <ArrowRight size={18} />
                                    </button>
                                    <a href="tel:4154167565" className="bg-white border-2 border-slate-100 px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black text-slate-900 uppercase tracking-wider md:tracking-widest hover:border-slate-300 transition-all flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm">
                                        <Phone size={16} className="text-emerald-600" /> Dispatch
                                    </a>
                                </div>
                            </div>

                            {/* Hero Card */}
                            <div className="lg:col-span-5 relative">
                                <div className="bg-slate-950 text-white rounded-3xl md:rounded-[40px] shadow-2xl p-6 md:p-10 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Truck size={120} className="md:w-[200px] md:h-[200px]" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-lg shadow-emerald-900/50">
                                            <Clock size={24} className="md:w-8 md:h-8 text-white" />
                                        </div>
                                        <h4 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">Zero Downtime.</h4>
                                        <p className="text-slate-400 font-medium mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                                            Weekend and after-hours appointments available to keep your fleet moving.
                                        </p>

                                        <button onClick={() => setView('booking')} className="w-full bg-white text-slate-950 py-4 md:py-5 rounded-xl md:rounded-2xl font-black hover:bg-emerald-50 transition-all flex justify-center items-center gap-2 text-sm md:text-base">
                                            Book Now <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Pricing Section */}
                        <section className="py-12 md:py-24 bg-[#F8FAFC] border-y border-slate-200 px-4 md:px-6">
                            <div className="max-w-7xl mx-auto">
                                <div className="text-center mb-8 md:mb-16">
                                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-3 md:mb-4 text-slate-950">Transparent Pricing.</h2>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-[11px]">Mobilization Fee included for Bay Area</p>
                                </div>
                                <div className="grid md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
                                    {pricingPlans.map((plan, i) => (
                                        <div key={i} className={`p-6 md:p-10 rounded-3xl md:rounded-[40px] border-2 transition-all relative flex flex-col ${plan.popular ? 'border-emerald-600 bg-white shadow-2xl shadow-emerald-100 md:scale-105 z-10' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                            {plan.popular && <div className="absolute top-0 center text-center w-full left-0 -translate-y-1/2"><span className="bg-emerald-600 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">Most Popular</span></div>}

                                            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 mb-4 md:mb-6">{plan.title}</h4>
                                            <div className="flex items-baseline gap-1 mb-1 md:mb-2">
                                                <span className="text-4xl md:text-5xl font-black text-slate-900">${plan.price}</span>
                                            </div>
                                            <p className="text-[10px] md:text-xs font-bold text-slate-400 mb-4 md:mb-8">Per Unit / Inspection</p>

                                            <ul className="space-y-2 md:space-y-4 mb-6 md:mb-10 flex-grow">
                                                {plan.features.map((f, j) => (
                                                    <li key={j} className="flex items-center gap-2 md:gap-3 text-[11px] md:text-xs font-bold text-slate-700">
                                                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                            <button
                                                onClick={() => { setFormData({ ...formData, selectedPlan: plan }); setView('booking'); }}
                                                className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${plan.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
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
                    <section className="pt-4 md:pt-10 pb-12 md:pb-24 px-4 md:px-6 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-6">
                        <div className="bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
                            <div className="bg-slate-900 p-5 md:p-8 text-white flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black">Book Inspection</h2>
                                    <p className="text-slate-400 text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-1">Step {step} of 3</p>
                                </div>
                                <button onClick={() => { setView('landing'); setStep(1); }} className="text-slate-400 hover:text-white transition-colors p-1"><X size={20} /></button>
                            </div>

                            <div className="p-5 md:p-10 flex-grow flex flex-col">
                                {/* Step 1: Location & Identity */}
                                {step === 1 && (
                                    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-4 md:gap-6">
                                        <div>
                                            <h3 className="text-base md:text-lg font-black mb-1">Service Location.</h3>
                                            <p className="text-[11px] md:text-xs text-slate-500 font-bold">Where should our tech meet the truck?</p>
                                        </div>

                                        <input type="text" placeholder="Full Name (Point of Contact)" className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                                        <div className="grid grid-cols-2 gap-2 md:gap-3">
                                            <input type="tel" placeholder="Phone" className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                            <input type="email" placeholder="Email" className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>

                                        <input type="text" placeholder="Yard Address (Street)" className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />

                                        <div className="space-y-3 md:space-y-4">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Zip Code & County</label>

                                            <div className="relative">
                                                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input type="text" placeholder="Enter ZIP Code" className="w-full p-3 md:p-4 pl-10 md:pl-12 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm" maxLength={5} value={formData.zipCode} onChange={e => setFormData({ ...formData, zipCode: e.target.value })} />
                                                {formData.county && <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-bold text-emerald-600">✓ {formData.county}</div>}
                                            </div>

                                            <BayAreaMap selectedCounty={formData.county} onSelect={(c) => setFormData({ ...formData, county: c })} />

                                            {formData.county && (
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                                                    <MapPin size={14} className="text-emerald-600 shrink-0" />
                                                    <p className="text-[11px] md:text-xs font-bold text-emerald-700">
                                                        {formData.county} service available: <span className="text-emerald-900">{COUNTY_SCHEDULE_DISPLAY[formData.county]}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <input type="text" placeholder="Gate Code / Special Instructions (Optional)" className="w-full p-3 md:p-5 bg-amber-50 border-2 border-amber-200 rounded-xl md:rounded-2xl outline-none font-bold text-sm text-slate-900 placeholder:text-amber-600/60" value={formData.memo} onChange={e => setFormData({ ...formData, memo: e.target.value })} />

                                        <div className="space-y-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Fleet Size</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['1', '2-10', '11-25', '25+'].map(s => (
                                                    <button key={s} onClick={() => setFormData({ ...formData, fleetSize: s })} className={`py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-black transition-all ${formData.fleetSize === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>{s}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Number of Trucks</label>
                                            <input type="number" min="1" placeholder="How many trucks?" className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm" value={formData.truckCount} onChange={e => setFormData({ ...formData, truckCount: e.target.value })} />
                                        </div>

                                        <button disabled={!formData.name || !formData.location || !formData.county || !formData.fleetSize || !formData.truckCount} onClick={() => setStep(2)} className="w-full bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-xl mt-2 md:mt-4 text-sm md:text-base">Next: Select Time</button>
                                    </div>
                                )}

                                {/* Step 2: Calendar */}
                                {step === 2 && (
                                    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-4 md:gap-6">
                                        <div>
                                            <h3 className="text-base md:text-lg font-black mb-1">Select Time.</h3>
                                            <p className="text-[11px] md:text-xs text-slate-500 font-bold">
                                                {formData.county} service: <span className="text-emerald-600 font-black">{COUNTY_SCHEDULE_DISPLAY[formData.county]}</span>
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl md:rounded-2xl p-3 md:p-4">
                                            <p className="text-[10px] md:text-sm font-black text-slate-900 mb-3">{calendarMonth}</p>
                                            <div className="grid grid-cols-7 gap-1 md:gap-2">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                                    <div key={i} className="text-[9px] md:text-[10px] font-black text-center text-slate-400 pb-1">{d}</div>
                                                ))}
                                                {calendarDates.map((d, i) => {
                                                    if (!d) return <div key={i} className="p-1 md:p-2"></div>;
                                                    return (
                                                        <button
                                                            key={i}
                                                            disabled={d.disabled}
                                                            onClick={() => setFormData({ ...formData, selectedDate: d.fullDate, selectedTime: '' })}
                                                            className={`p-1.5 md:p-2 rounded-lg md:rounded-xl text-[11px] md:text-xs font-black transition-all ${
                                                                formData.selectedDate === d.fullDate
                                                                    ? 'bg-emerald-600 text-white shadow-lg scale-105'
                                                                    : d.disabled
                                                                        ? 'opacity-20 bg-slate-100 text-slate-300 cursor-not-allowed'
                                                                        : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
                                                            }`}
                                                        >
                                                            {d.day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {formData.selectedDate && (
                                            <div className="space-y-2 md:space-y-3">
                                                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Available Times for {formData.selectedDate}</p>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {TIME_SLOTS.map(t => {
                                                        const busy = isSlotBusy(t);
                                                        return (
                                                            <button
                                                                disabled={busy}
                                                                key={t}
                                                                onClick={() => setFormData({ ...formData, selectedTime: t })}
                                                                className={`px-3 py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold border transition-all ${
                                                                    formData.selectedTime === t
                                                                        ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                                                                        : busy
                                                                            ? 'border-red-100 bg-red-50 text-red-300 line-through cursor-not-allowed'
                                                                            : 'border-slate-200 bg-white hover:border-emerald-200'
                                                                }`}
                                                            >
                                                                {t}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3 md:gap-4 mt-auto pt-4">
                                            <button onClick={() => setStep(1)} className="px-4 md:px-6 py-4 md:py-5 bg-slate-50 rounded-xl md:rounded-2xl font-bold text-slate-500 text-sm">Back</button>
                                            <button disabled={!formData.selectedDate || !formData.selectedTime} onClick={() => setStep(3)} className="flex-grow bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-xl text-sm md:text-base">Review & Pay</button>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Review & Checkout */}
                                {step === 3 && (
                                    <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col gap-4 md:gap-6">
                                        <div className="text-center">
                                            <h2 className="text-xl md:text-2xl font-black tracking-tight">Review & Pay</h2>
                                            <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">Total: ${calculateTotal()}.00</p>
                                        </div>

                                        <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl space-y-3 md:space-y-4">
                                            <div className="border-b border-slate-200 pb-3 md:pb-4">
                                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment</p>
                                                <p className="text-sm md:text-base font-bold text-slate-900">{formData.selectedDate} @ {formData.selectedTime}</p>
                                            </div>
                                            <div className="border-b border-slate-200 pb-3 md:pb-4">
                                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                                <p className="text-sm font-bold text-slate-900">{formData.name}</p>
                                                <p className="text-[11px] md:text-xs text-slate-500">{formData.phone} • {formData.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                                <p className="text-sm font-bold text-slate-900">{formData.location}</p>
                                                <p className="text-[11px] md:text-xs text-slate-500">{formData.county} County</p>
                                                {formData.memo && <p className="text-[11px] md:text-xs text-amber-600 mt-1">Note: {formData.memo}</p>}
                                            </div>
                                        </div>

                                        {/* Price Summary */}
                                        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[11px] md:text-sm font-bold text-slate-600">{formData.truckCount} truck{parseInt(formData.truckCount) > 1 ? 's' : ''} × ${getPricePerTruck(formData.truckCount)}</span>
                                                <span className="text-[10px] md:text-sm font-bold text-slate-400">{parseInt(formData.truckCount) === 1 ? 'Standard' : parseInt(formData.truckCount) <= 10 ? 'Fleet' : 'Enterprise'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-base md:text-lg font-black text-slate-900">Total</span>
                                                <span className="text-2xl md:text-3xl font-black text-emerald-600">${calculateTotal()}</span>
                                            </div>
                                        </div>

                                        <button onClick={handleFinalBooking} disabled={loading} className="w-full bg-black disabled:bg-slate-400 text-white py-5 md:py-6 rounded-xl md:rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
                                            {loading ? 'Processing...' : 'Pay Now'}
                                            <ArrowRight size={16} />
                                        </button>

                                        <p className="text-[8px] md:text-[9px] text-center text-slate-400 font-medium">
                                            Secure checkout via Stripe. Apple Pay, Google Pay, and Cards accepted.
                                        </p>

                                        <button onClick={() => setStep(2)} className="text-center text-[10px] font-bold text-slate-400">Back to Calendar</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Quick Charge POS View */}
                {view === 'quickcharge' && (
                    <section className="pt-16 md:pt-24 pb-12 md:pb-24 px-4 md:px-6 min-h-screen">
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-6 md:mb-8">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-amber-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
                                    <Zap size={28} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight">Quick Charge</h2>
                                <p className="text-slate-500 text-xs md:text-sm mt-2">Point of Sale - No scheduling required</p>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl space-y-4 md:space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter customer name"
                                        className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm md:text-base"
                                        value={quickChargeData.customerName}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, customerName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Number of Trucks</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm md:text-base"
                                        value={quickChargeData.truckCount}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, truckCount: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Notes (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="VIN, plate, or other notes"
                                        className="w-full p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border-none outline-none font-bold text-sm"
                                        value={quickChargeData.notes}
                                        onChange={e => setQuickChargeData({ ...quickChargeData, notes: e.target.value })}
                                    />
                                </div>

                                {/* Price Summary */}
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl md:rounded-2xl p-4 md:p-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] md:text-sm font-bold text-slate-600">
                                            {quickChargeData.truckCount || 1} truck{parseInt(quickChargeData.truckCount) > 1 ? 's' : ''} × ${getPricePerTruck(quickChargeData.truckCount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-base md:text-lg font-black text-slate-900">Total</span>
                                        <span className="text-2xl md:text-3xl font-black text-amber-600">
                                            ${(parseInt(quickChargeData.truckCount) || 1) * getPricePerTruck(quickChargeData.truckCount)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleQuickCharge}
                                    disabled={loading || !quickChargeData.customerName}
                                    className="w-full bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base"
                                >
                                    {loading ? 'Processing...' : 'Charge Now'}
                                    <ArrowRight size={16} />
                                </button>

                                <button onClick={() => setView('landing')} className="w-full text-center text-slate-400 font-bold text-xs md:text-sm hover:text-slate-600 transition-colors">
                                    ← Back to Home
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {view === 'success' && (
                    <section className="pt-16 md:pt-24 pb-12 md:pb-24 px-4 md:px-6 text-center animate-in zoom-in-95">
                        <div className="max-w-xl mx-auto">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-2xl shadow-emerald-200">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3 md:mb-4 leading-none">You're Booked!</h2>
                            <p className="text-base md:text-lg text-slate-500 font-medium mb-8 md:mb-10 leading-relaxed">
                                {formData.selectedDate && formData.selectedTime ? (
                                    <>Confirmed for <span className="text-slate-900 font-bold underline decoration-emerald-500">{formData.selectedDate} at {formData.selectedTime}</span>.</>
                                ) : (
                                    <>Your payment has been processed successfully.</>
                                )}
                            </p>
                            <div className="bg-white border border-slate-100 p-6 md:p-10 rounded-3xl md:rounded-[48px] text-left mb-8 md:mb-10 shadow-xl">
                                <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">What Happens Next</h4>
                                <ul className="space-y-4 md:space-y-6">
                                    <li className="flex gap-3 md:gap-4 items-start">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] md:text-[10px] font-black shrink-0">1</div>
                                        <p className="text-[11px] md:text-xs font-bold text-slate-700">Your appointment is synced to our dispatch calendar.</p>
                                    </li>
                                    <li className="flex gap-3 md:gap-4 items-start">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] md:text-[10px] font-black shrink-0">2</div>
                                        <p className="text-[11px] md:text-xs font-bold text-slate-700">Our mobile unit will arrive within a 30-minute window of your time.</p>
                                    </li>
                                    <li className="flex gap-3 md:gap-4 items-start">
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] md:text-[10px] font-black shrink-0">3</div>
                                        <p className="text-[11px] md:text-xs font-bold text-slate-700">Results uploaded to CARB within 24 hours. Certificate sent via email.</p>
                                    </li>
                                </ul>
                            </div>
                            <button onClick={() => { setView('landing'); setStep(1); }} className="text-emerald-600 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:tracking-[0.2em] transition-all">Back to Home</button>
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 md:py-24 px-4 md:px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-12">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3 md:mb-4">
                            <div className="bg-emerald-600 p-1.5 rounded-lg text-white"><Truck size={18} /></div>
                            <span className="text-lg md:text-xl font-black tracking-tighter uppercase">GSCTC</span>
                        </div>
                        <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-relaxed">Bay Area Clean Truck Check Specialists</p>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">415.416.7565</p>
                        <p className="text-[11px] md:text-xs font-bold text-slate-500 mt-1">Goldenstatectc@gmail.com</p>
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] md:tracking-[0.2em] mt-2">Open 7 Days — Mobile Dispatch</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
