import { Board } from '@/features/builder/components/Board';
import { Sidebar } from '@/features/builder/components/Sidebar';

export default function Home() {
  return (
    <main className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Левая панель выбора */}
      <Sidebar />

      {/* Основная рабочая область */}
      <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tighter uppercase">
          Custom Rig Builder
        </h1>
        
        <Board />

        <p className="mt-6 text-zinc-500 text-sm">
          Нажмите на педаль в библиотеке, чтобы добавить её на борд
        </p>
      </div>
    </main>
  );
}