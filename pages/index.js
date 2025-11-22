import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-8">Atmamanthan</h1>
        <p className="text-2xl text-gray-300 mb-12">Immersive Journey Experience</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link href="/table">
            <div className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg text-xl font-semibold transition-all duration-300 hover:scale-105 cursor-pointer">
              Table Screen
            </div>
          </Link>
          
          <Link href="/mirror">
            <div className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-lg text-xl font-semibold transition-all duration-300 hover:scale-105 cursor-pointer">
              Mirror Screen
            </div>
          </Link>
          
          <Link href="/admin/login">
            <div className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-lg text-xl font-semibold transition-all duration-300 hover:scale-105 cursor-pointer">
              Admin Panel
            </div>
          </Link>
          
          <div className="bg-gray-700 text-gray-300 px-8 py-6 rounded-lg text-xl font-semibold">
            <div className="text-sm mb-2">Status</div>
            <div className="text-lg">Ready</div>
          </div>
        </div>
        
        <div className="mt-12 text-gray-400 text-sm">
          <p>Select a screen to begin the journey</p>
        </div>
      </div>
    </div>
  );
}

