import { useState } from "react";

export default function LoginSection() {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: call API login
    console.log("Login payload:", form);
  };

  return (
    <div className="bg-[url(/img/slider-03-b.jpg)] lg:h-[687px] object-cover bg-no-repeat">
      <div className="container">
        <div className="grid lg:grid-cols-3 pt-[100px]">
          <div className="bg-[#0a0f1f]/30 text-white rounded-3xl shadow-3xl p-4 col-span-1">
            <img
              src="/img/logo.png"
              alt="logo"
              className="justify-self-center h-[60px] w-auto"
            />

            <form className="w-full max-w-md pt-4" onSubmit={onSubmit}>
              {/* Email */}
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full h-12 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition"
                value={form.email}
                onChange={onChange}
                required
              />

              {/* Phone */}
              <label htmlFor="phone" className="sr-only">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Number Phone"
                className="w-full h-12 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition mt-4"
                value={form.phone}
                onChange={onChange}
              />

              {/* Password */}
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                className="w-full h-12 px-4 rounded-lg bg-white color-title border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none focus:border-white/30 focus:ring-2 focus:ring-white/15 transition mt-4"
                value={form.password}
                onChange={onChange}
                required
              />

              <button
                className="bg-blue-400 rounded-lg px-8 py-4 mt-4 w-full"
                type="submit"
              >
                Đăng Nhập
              </button>
            </form>

            <p className="py-8 text-center">------------ OR ------------</p>

            <button className="bg-blue-400 rounded-lg lg:px-20 py-4 mt-4 w-full">
              Đăng Nhập Với Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
