import { useState } from "react";

function Unused() {
  const [width, setWidth] = useState(50);
  return (
    <>
      {/* <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold" onClick={() => setWidth(prevState => prevState + 5)}>+ 5</button> */}
      {/* <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-6 py-2 rounded-lg font-semibold" onClick={() => setWidth(prevState => prevState - 5)}>- 5</button> */}
      {/* TIMER */}
      {/* <div className="relative h-8 sm:h-12 overflow-hidden rounded-lg bg-gray-800 w-1/4 ">
          <div className="h-full rounded-lg bg-gray-700 transition-all duration-1000" style={{ width: `${width}%` }}>
          <span class="absolute inset-0 flex items-center justify-center sm:text-base text-sm font-semibold text-white select-none">TIME HERE</span>
          </div>
          </div> */}
    </>
  );
}

export default Unused;