import { useEffect, useState } from "react";

const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Moving gradient orbs */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${
              mousePosition.x * (isHovering ? 0.01 : 0.05)
            }px, ${mousePosition.y * (isHovering ? 0.01 : 0.05)}px)`,
            transition: `transform ${isHovering ? "1s" : "0.5s"} ease-out`,
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-full blur-2xl animate-bounce"
          style={{
            transform: `translate(${
              -mousePosition.x * (isHovering ? 0.005 : 0.03)
            }px, ${-mousePosition.y * (isHovering ? 0.005 : 0.03)}px)`,
            transition: `transform ${isHovering ? "1.2s" : "0.3s"} ease-out`,
            animationDelay: "1s",
            animationDuration: isHovering ? "8s" : "4s",
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-ping"
          style={{
            transform: `translate(${
              mousePosition.x * (isHovering ? 0.003 : 0.02)
            }px, ${mousePosition.y * (isHovering ? 0.003 : 0.02)}px)`,
            transition: `transform ${isHovering ? "1.5s" : "0.4s"} ease-out`,
            animationDuration: isHovering ? "12s" : "6s",
          }}
        />
      </div>

      {/* Floating file icons */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { icon: "📄", name: "document.pdf", size: "text-2xl" },
          { icon: "🖼️", name: "image.jpg", size: "text-xl" },
          { icon: "🎵", name: "audio.mp3", size: "text-lg" },
          { icon: "🎬", name: "video.mp4", size: "text-2xl" },
          { icon: "📊", name: "data.xlsx", size: "text-lg" },
          { icon: "💾", name: "backup.zip", size: "text-xl" },
          { icon: "📝", name: "notes.txt", size: "text-lg" },
          { icon: "🎨", name: "design.psd", size: "text-xl" },
          { icon: "📋", name: "report.docx", size: "text-lg" },
          { icon: "🔐", name: "secure.enc", size: "text-xl" },
        ].map((file, i) => (
          <div
            key={i}
            className="absolute opacity-20 hover:opacity-40 transition-opacity duration-300 cursor-pointer"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
              animation: `float ${15 + Math.random() * 10}s infinite linear`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 30 - 15}deg)`,
              animationPlayState: isHovering ? "paused" : "running",
            }}
          >
            <div className="flex flex-col items-center space-y-1 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
              <span className={file.size}>{file.icon}</span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {file.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
          }
        }
      `}</style>

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Logo/Title with stagger animation */}
        <div className="mb-8">
          <h1
            className={`text-7xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-purple-50 to-indi-100 bg-clip-text text-transparent transition-all duration-1000 transform ${
              isLoaded
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-10"
            }`}
            style={{
              filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.3))",
              textShadow: "0 0 40px rgba(147, 51, 234, 0.5)",
            }}
          >
            SecureSend
          </h1>

          {/* Animated underline */}
          <div
            className="mt-4 mx-auto h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"
            style={{
              width: isLoaded ? "300px" : "0px",
              transition: "width 1.5s ease-out 0.5s",
            }}
          />
        </div>

        {/* Subtitle with typewriter effect */}
        <p
          className={`text-2xl md:text-3xl text-gray-300 mb-12 transition-all duration-1000 delay-500 transform ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          The{" "}
          <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text font-semibold">
            simplest
          </span>{" "}
          way to send files{" "}
          <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold">
            securely
          </span>
          .
        </p>

        {/* Interactive buttons */}
        <div
          className={`space-x-6 transition-all duration-1000 delay-700 transform ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <a
            href="/login"
            className="group relative inline-block px-8 py-3 font-medium text-lg rounded-lg text-white border border-white/20 hover:border-white/40 bg-transparent hover:bg-white/5 transition-all duration-300 transform hover:scale-105"
          >
            Login
          </a>

          <a
            href="/register"
            className="group relative inline-block px-8 py-3 font-medium text-lg rounded-lg text-slate-900 border border-slate-300 hover:border-white bg-slate-200/90 hover:bg-white transition-all duration-300 transform hover:scale-105"
          >
            Register
          </a>
        </div>

        {/* Feature highlights with hover effects */}
        <div
          className={`mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4 transition-all duration-1000 delay-1000 transform ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {[
            {
              icon: "🔒",
              title: "End-to-End Encryption",
            },
            {
              icon: "⚡",
              title: "Lightning Fast",
            },
            {
              icon: "🌐",
              title: "Universal Access",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 cursor-pointer"
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive mouse follower */}
      <div
        className="fixed pointer-events-none z-20 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 blur-sm"
        style={{
          left: `${mousePosition.x}%`,
          top: `${mousePosition.y}%`,
          transform: "translate(-50%, -50%)",
          transition: `all ${isHovering ? "0.3s" : "0.1s"} ease-out`,
        }}
      />
    </div>
  );
};

export default HomePage;
