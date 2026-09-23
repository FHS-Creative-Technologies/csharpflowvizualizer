import { useEffect } from 'react';
import { Chart } from './components/chart';
import type { BaseInfo } from '../types';
import type { Node } from '@xyflow/react';
import type { WebviewToExtensionMessage } from '../../src/messages';
import useRoslynStore from './store/useRoslynStore';
import { Button } from './components/ui/button';
import { Activity, Braces, MousePointerClick, ScanSearch } from 'lucide-react';


export default function App() {
  const { loading, data, activeLine, highlightedRange, response, initializeVsCodeApi, setupMessageListener, sendMessage } = useRoslynStore();
  const topLevelItems = data?.length ?? 0;
  const highlightedLabel = highlightedRange
    ? `${highlightedRange.startLine}-${highlightedRange.endLine}`
    : 'None';

  useEffect(() => {
    initializeVsCodeApi();
    const cleanup = setupMessageListener();
    return cleanup;
  }, [initializeVsCodeApi, setupMessageListener]);

  const handleGetFileContent = () => {
    const message: WebviewToExtensionMessage = { command: 'getFileContent' };
    sendMessage(message);
  };

  const handleNodeClick = (node: Node<BaseInfo>) => {
    const message: WebviewToExtensionMessage = {
      command: 'highlightLine',
      data: { startLine: node.data.startLine, endLine: node.data.endLine }
    };
    sendMessage(message);
  };

  return (
    <main className='min-h-screen px-4 py-5 md:px-6 md:py-6 '>
      <section className='mx-auto flex w-full max-w-full flex-col gap-6'>
        <div className='grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)] '>
          <aside className='border-muted bg-background relative overflow-hidden rounded-lg border p-5 shadow-[0_24px_70px_rgba(33,43,70,0.05)] backdrop-blur-xl'>
            <div className='pointer-events-none absolute inset-x-6 top-0 h-24 rounded-b-full ' />

            <div className='relative flex flex-col gap-6 '>
              <hgroup className='flex flex-col gap-3'>
                <span className='inline-flex w-fit items-center rounded-full border border-muted  px-3 py-1 text-[11px] font-semibold text-muted-foreground'>
                  Structural Map
                </span>
                <div className='space-y-2'>
                  <h1 className='text-3xl font-semibold text-foreground md:text-[2rem]'>
                    C# Visualizer
                  </h1>
                  <p className='max-w-sm text-sm  text-muted-foreground'>
                    Inspect the structure of the active C# file, follow control flow, and keep graph focus aligned with the editor selection.
                  </p>
                </div>
              </hgroup>

              <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-1'>
                <div className='rounded-lg border border-muted bg-background p-4 shadow-sm'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <div className='rounded-full bg-amber-100 p-2 text-amber-700'>
                      <Braces className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Top Level Blocks</p>
                      <p className='mt-1 text-2xl font-semibold text-foreground'>{topLevelItems}</p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg border border-muted bg-background p-4 shadow-sm'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <div className='rounded-full bg-sky-100 p-2 text-sky-700'>
                      <ScanSearch className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Highlighted Range</p>
                      <p className='mt-1 text-lg font-semibold text-foreground'>{highlightedLabel}</p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg border border-muted bg-background p-4 shadow-sm sm:col-span-2 xl:col-span-1'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <div className='rounded-full bg-violet-100 p-2 text-violet-700'>
                      <Activity className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-xs text-muted-foreground'>Active Line</p>
                      <p className='mt-1 text-lg font-semibold text-foreground'>{activeLine ?? 'No selection'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='rounded-lg bg-background border border-muted px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'>
                <div className='mb-4 flex items-center gap-2 text-xs font-semibold  tracking-[0.2em] text-muted-foreground'>
                  <MousePointerClick className='h-3.5 w-3.5' />
                  Actions
                </div>
                <div className='flex flex-col gap-3'>
                  <Button
                    variant={'destructive'}
                    onClick={handleGetFileContent}
                    disabled={loading}
                    aria-label='Get file content from extension'
                    className='w-full justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] text-background'
                  >
                    {loading ? 'Analyzing Active File...' : 'Analyze Active File'}
                  </Button>
                  <p className='rounded-md border border-muted  px-2 py-2 text-sm leading-6 text-muted-foreground'>
                    {response}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className='rounded-lg border border-muted bg-background p-3 shadow-[0_24px_70px_rgba(33,43,70,0.05)] backdrop-blur-xl md:p-4'>
            <div className='rounded-lg border border-slate-200/75 bg-background p-4 md:p-5'>
              <div className='mb-4 flex flex-col gap-3 border-b border-muted pb-4 md:flex-row md:items-end md:justify-between'>
                <div>
                  <p className='text-xs font-semibold text-muted-foreground'>Graph View</p>
                  <h2 className='mt-2 text-2xl font-semibold text-foreground'>Control Flow Canvas</h2>
                </div>
                <p className='max-w-md text-sm  text-muted-foreground'>
                  Click a node to toggle line highlighting in the editor. Moving the cursor in the editor updates the active block here.
                </p>
              </div>

              <div className='overflow-hidden rounded-lg border border-muted bg-background p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] md:p-3'>
                <Chart data={data} activeLine={activeLine} highlightedRange={highlightedRange} handleNodeClick={handleNodeClick} />
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );


}
