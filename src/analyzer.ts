import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { logError, logInfo } from './logging';

const analyzerProjectPath = path.resolve(__dirname, '..', 'roslynAnalyzer');
const analyzerProjectFilePath = path.join(analyzerProjectPath, 'roslynAnalyzer.csproj');
const packagedAnalyzerAssemblyPath = path.resolve(__dirname, '..', 'analyzer-dist', 'roslynAnalyzer.dll');

/**
 * Determines the command to run the Roslyn analyzer, preferring a packaged assembly if available, and falling back to running the project directly during development.
 * This allows for flexibility in how the analyzer is executed, supporting both development and production scenarios without requiring changes to the codebase.
 * 
 * @returns 
 */
function createAnalyzerCommand(): { args: string[]; targetDescription: string } {
    if (fs.existsSync(analyzerProjectFilePath)) {
        return {
            args: ['run', '--no-build', '--project', analyzerProjectPath],
            targetDescription: `${analyzerProjectPath} (development)`
        };
    }

    if (fs.existsSync(packagedAnalyzerAssemblyPath)) {
        return {
            args: [packagedAnalyzerAssemblyPath],
            targetDescription: packagedAnalyzerAssemblyPath
        };
    }

    return {
        args: ['run', '--no-build', '--project', analyzerProjectPath],
        targetDescription: `${analyzerProjectPath} (development fallback)`
    };
}

function tryParseAnalyzerJson(output: string): unknown {
    const trimmed = output.trim();
    if (!trimmed) {
        throw new Error('Roslyn analyzer returned no output.');
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        const firstArrayStart = trimmed.indexOf('[');
        const lastArrayEnd = trimmed.lastIndexOf(']');

        if (firstArrayStart >= 0 && lastArrayEnd > firstArrayStart) {
            const candidate = trimmed.slice(firstArrayStart, lastArrayEnd + 1);
            return JSON.parse(candidate);
        }

        throw new Error('Roslyn analyzer output did not contain a valid JSON payload.');
    }
}

/**
 * Formats the error message for a failed analyzer execution.
 * 
 * @param stdout 
 * @param stderr 
 * @param exitCode 
 * @returns 
 */
function formatAnalyzerFailure(stdout: string, stderr: string, exitCode: number | null): Error {
    const output = [stderr.trim(), stdout.trim()].filter(Boolean).join('\n');

    if (output) {
        return new Error(output);
    }

    return new Error(`Roslyn analyzer exited with code ${exitCode}`);
}

/**
 * 
 * Runs the Roslyn analyzer as a separate process, passing the provided C# code via standard input, and returns a promise that resolves with the parsed JSON result or rejects with an error if the process fails or returns invalid output.
 * 
 * @param code 
 * @returns 
 */
export function analyzeCode(code: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const { args, targetDescription } = createAnalyzerCommand();
        const proc = spawn('dotnet', args);

        let res = '';
        let stderr = '';

        logInfo(`Starting Roslyn analyzer using ${targetDescription}`);

        proc.on('error', (error) => {
            const analyzerError = new Error(`Failed to start Roslyn analyzer: ${error.message}`);
            logError(analyzerError.message);
            reject(analyzerError);
        });

        proc.stdin.write(code);
        proc.stdin.end();

        proc.stdout.on('data', (data) => {
            res += data.toString('utf8');
        });

        proc.stderr.on('data', d => {
            const s = d.toString('utf8');
            stderr += s;
        });

        proc.on('close', (code) => {
            if (code !== 0) {
                const analyzerError = formatAnalyzerFailure(res, stderr, code);
                logError(analyzerError.message);
                reject(analyzerError);
                return;
            }

            if (!res.trim()) {
                const analyzerError = new Error('Roslyn analyzer returned no output.');
                logError(analyzerError.message);
                reject(analyzerError);
                return;
            }

            try {
                const parsed = tryParseAnalyzerJson(res);
                logInfo('Roslyn analysis completed successfully.');
                resolve(parsed);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown JSON parse error';
                const analyzerError = new Error(`Roslyn analyzer returned invalid JSON: ${message}\n${res.trim()}`);
                logError(analyzerError.message);
                reject(analyzerError);
            }
        });
    });
}

