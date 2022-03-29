import { expandGlobSync } from 'https://deno.land/std@0.132.0/fs/mod.ts';
import { getStateAndTarget, IStateAndTarget } from './state-util.ts';

/**
 * Find Controllers result.
 */
export type FindControllersResult = Array<IStateAndTarget>;

/**
 * Finds classes using the specified pattern and options.
 *
 * @param pattern Glob pattern
 * @param opts Glob options
 */
export async function findControllers(
  pattern: string,
): Promise<FindControllersResult> {
  const result = [...expandGlobSync(pattern)].map((e) => e.path);
  return (await Promise.all(result
    .map(async (path) => {
      const items: Array<IStateAndTarget | null> = [];

      const mod = await import(path);

      if (mod) {
        const stateAndTarget = getStateAndTarget(mod);
        if (stateAndTarget) {
          items.push(stateAndTarget);
          return items;
        }

        // loop through exports - this will cover named as well as a default export
        for (const key of Object.keys(mod)) {
          items.push(getStateAndTarget(mod[key]));
        }
      }

      return items;
    })))
    .reduce((acc, cur) => acc.concat(cur), [])
    .filter((x) => x !== null) as FindControllersResult;
}
