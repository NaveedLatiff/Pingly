const Loader = ({ size = "w-20 h-20", thickness = "border-7" }) => {
    return (
        <div className="h-screen w-screen  flex items-center justify-center bg-gradient-to-b from-black via-zinc-900 to-black">
            <div
                className={`

          ${size} 
          ${thickness} 
          border-white/20     
         border-t-white      
          rounded-full 
          animate-spin
        `}
                role="status"
                aria-label="loading"
            >
            </div>
        </div>
    );
};

export default Loader;