export default function AuthRobotIllustration() {
  return (
    <div className="relative mx-auto h-full w-full max-w-[420px]" aria-hidden="true">
      <div className="absolute left-1/2 top-[16%] h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),rgba(255,255,255,0.03)_38%,rgba(0,0,0,0)_72%)] blur-2xl" />
      <div className="absolute left-1/2 top-[58%] h-[120px] w-[260px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.45),rgba(0,0,0,0)_72%)] blur-2xl" />

      <svg
        viewBox="0 0 520 620"
        className="relative h-full w-full overflow-visible drop-shadow-[0_42px_70px_rgba(0,0,0,0.6)]"
        fill="none"
      >
        <defs>
          <linearGradient id="robot-black-shell" x1="132" y1="86" x2="400" y2="444">
            <stop offset="0" stopColor="#30343a" />
            <stop offset="0.18" stopColor="#121418" />
            <stop offset="0.5" stopColor="#040507" />
            <stop offset="1" stopColor="#000000" />
          </linearGradient>
          <linearGradient id="robot-black-shell-soft" x1="178" y1="96" x2="394" y2="382">
            <stop offset="0" stopColor="#5a616c" />
            <stop offset="0.18" stopColor="#20242b" />
            <stop offset="0.5" stopColor="#050608" />
            <stop offset="1" stopColor="#010101" />
          </linearGradient>
          <linearGradient id="robot-neck-core" x1="206" y1="438" x2="260" y2="592">
            <stop offset="0" stopColor="#f38b3a" />
            <stop offset="0.42" stopColor="#9f4413" />
            <stop offset="1" stopColor="#23120c" />
          </linearGradient>
          <linearGradient id="robot-neck-shell" x1="156" y1="408" x2="310" y2="586">
            <stop offset="0" stopColor="#2b2f36" />
            <stop offset="0.36" stopColor="#0e1014" />
            <stop offset="1" stopColor="#020203" />
          </linearGradient>
          <linearGradient id="robot-highlight" x1="132" y1="76" x2="330" y2="236">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.12" stopColor="#dfe4ea" stopOpacity="0.65" />
            <stop offset="0.38" stopColor="#808791" stopOpacity="0.18" />
            <stop offset="1" stopColor="#0a0b0d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="robot-highlight-2" x1="118" y1="142" x2="274" y2="492">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="0.22" stopColor="#d4d9e1" stopOpacity="0.24" />
            <stop offset="1" stopColor="#090a0d" stopOpacity="0" />
          </linearGradient>
          <radialGradient
            id="robot-ear-core"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(295 258) rotate(90) scale(40 40)"
          >
            <stop offset="0" stopColor="#f7f8fb" />
            <stop offset="0.16" stopColor="#d6dbe2" />
            <stop offset="0.38" stopColor="#7f8792" />
            <stop offset="0.7" stopColor="#22262d" />
            <stop offset="1" stopColor="#050608" />
          </radialGradient>
          <radialGradient
            id="robot-eye-glow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(198 298) rotate(90) scale(18 18)"
          >
            <stop offset="0" stopColor="#ffd298" />
            <stop offset="0.38" stopColor="#ff9a3b" />
            <stop offset="1" stopColor="#742d00" />
          </radialGradient>
          <filter id="robot-shadow" x="0" y="0" width="520" height="620" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="24" stdDeviation="22" floodColor="#000000" floodOpacity="0.42" />
          </filter>
        </defs>

        <g filter="url(#robot-shadow)">
          <path
            d="M171 563c14-37 33-69 58-95 20-21 43-37 63-43l18 15 18 68c5 21 17 38 34 49l17 11H192c-17 0-28-17-21-35z"
            fill="url(#robot-neck-shell)"
          />
          <path
            d="M208 545c8-40 23-77 47-105 14-16 32-30 43-33l11 61c4 23 2 53-3 76h-98z"
            fill="url(#robot-neck-core)"
          />
          <path
            d="M305 69c49 3 96 23 129 58 37 39 54 89 52 156-2 77-20 132-58 174-42 48-103 71-175 66-50-3-91-22-123-57-34-38-52-92-50-154 1-47 12-94 31-132 20-39 56-77 89-93 32-16 72-22 105-18z"
            fill="url(#robot-black-shell)"
          />
          <path
            d="M323 82c47 7 86 29 114 63 28 33 40 72 40 131 0 72-16 124-51 166-37 44-92 67-157 67l-14-1 19-31c31-51 42-104 40-188-1-54-6-71-33-118-16-27-35-50-61-72l-16-14 21-3c27-4 33-4 58 0z"
            fill="url(#robot-black-shell-soft)"
          />
          <path
            d="M155 136c28-36 77-61 127-65l9 27c5 16 18 25 39 30 48 10 84 38 106 81 17 35 22 56 22 104 0 55-6 80-30 121-31 53-84 90-146 102-26 5-30 3-51-20-38-44-56-100-56-177 0-49 6-84 20-121 11-28 12-29 26-12 16 18 40 22 56 7 15-16 14-42-4-61-15-14-60-24-93-20l-19 2 12-18z"
            fill="#07080a"
          />
          <path
            d="M172 165c19 0 45 6 58 14 11 7 10 10-9 22-11 8-28 25-37 38l-17 23-8-20c-10-26-4-55 17-77 12-13 20-16 34-12 10 3 21 9 24 12 11 11 6 31-9 42-18 13-34 7-43-17-5-15-7-15-10-4-7 22 6 43 28 49 16 4 25 0 43-17 19-20 22-28 17-48-9-38-41-58-88-55z"
            fill="#15181d"
            fillOpacity="0.76"
          />
          <path
            d="M304 104c40 16 76 48 96 86 22 41 28 70 28 133 0 77-14 129-47 173-18 25-61 56-87 64l-17 6 16-30c20-39 32-85 37-151 8-104-25-190-94-243l-23-18 27-17c16-9 31-17 35-17s17 6 29 14z"
            fill="#0d0f13"
            fillOpacity="0.8"
          />
          <path
            d="M134 126c25-24 67-42 116-49"
            stroke="url(#robot-highlight)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M118 170c-10 48-7 127 7 174 18 60 56 113 97 136"
            stroke="url(#robot-highlight-2)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M143 430c14 34 37 67 59 84"
            stroke="#ffffff"
            strokeOpacity="0.1"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M319 167c18 3 46 17 59 31 10 10 11 13 2 20-7 4-26 7-43 7-31 0-68 19-87 44-5 8-13 11-18 7-17-10-22-40-10-61 15-28 61-53 97-53z"
            fill="#0c0d10"
          />
          <path
            d="M255 178c-16 12-29 31-36 50l-6 18-20-6c-11-3-27-14-36-23-17-18-17-18 12-43 29-24 80-42 108-37 12 2 11 5-22 41z"
            fill="#0a0b0e"
          />
          <path
            d="M173 296c8-27 31-54 58-67 23-11 79-21 79-14 0 2-7 14-16 26-10 14-22 43-29 72-1 7-58 1-79-9-18-9-20-13-13-8z"
            fill="#15181d"
          />
          <circle cx="295" cy="258" r="58" fill="#030405" />
          <circle cx="295" cy="258" r="48" fill="#060709" stroke="#0f1115" strokeWidth="8" />
          <circle cx="295" cy="258" r="33" fill="url(#robot-ear-core)" />
          <circle cx="295" cy="258" r="18" fill="#050608" />
          <circle cx="295" cy="258" r="8" fill="#e8ebef" />
          <path
            d="M271 216c23-8 52-7 74 1"
            stroke="#ffffff"
            strokeOpacity="0.22"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M204 298c13-3 22 10 17 22-4 11-19 15-28 7-9-9-3-26 11-29z"
            fill="url(#robot-eye-glow)"
          />
          <path
            d="M180 365c20 12 49 17 73 13"
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M225 435c17-3 35-12 47-27"
            stroke="#f38b3a"
            strokeOpacity="0.7"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M377 310l39 14-21 35-41-16 23-33z"
            fill="#121418"
          />
          <path
            d="M391 319l11 4M386 329l14 5M380 339l15 6"
            stroke="#f0d18e"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M305 104c42 6 76 21 104 48"
            stroke="#ffffff"
            strokeOpacity="0.14"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M147 147c18-17 48-31 75-36"
            stroke="#ffffff"
            strokeOpacity="0.2"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M194 500c22 12 53 16 86 10"
            stroke="#ffffff"
            strokeOpacity="0.08"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
