#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { push, pushTags, tag } from '../lib/git.js';
const p = resolve(process.cwd(), process.argv[2] ?? '.');
const packageJson = JSON.parse(await readFile(join(p, 'package.json'), 'utf-8'));
await tag(p, 'v' + packageJson.version);
const { gitHead, ...headless } = packageJson;
await writeFile(join(p, 'package.json'), JSON.stringify(headless, undefined, '  ') + '\n', 'utf-8');
await push(p);
await pushTags(p);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDdkQsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDMUMsT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUV6RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUM1QixNQUFNLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUlqRCxDQUFDO0FBRUYsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFeEMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLFFBQVEsRUFBRSxHQUFHLFdBQVcsQ0FBQztBQUM3QyxNQUFNLFNBQVMsQ0FDYixJQUFJLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxFQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUNoRCxPQUFPLENBQ1IsQ0FBQztBQUVGLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2QsTUFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB7IHJlYWRGaWxlLCB3cml0ZUZpbGUgfSBmcm9tICdub2RlOmZzL3Byb21pc2VzJztcbmltcG9ydCB7IGpvaW4sIHJlc29sdmUgfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgcHVzaCwgcHVzaFRhZ3MsIHRhZyB9IGZyb20gJy4uL2xpYi9naXQuanMnO1xuXG5jb25zdCBwID0gcmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBwcm9jZXNzLmFyZ3ZbMl0gPz8gJy4nKTtcblxuY29uc3QgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKFxuICBhd2FpdCByZWFkRmlsZShqb2luKHAsICdwYWNrYWdlLmpzb24nKSwgJ3V0Zi04JylcbikgYXMge1xuICB2ZXJzaW9uOiBzdHJpbmc7XG4gIGdpdEhlYWQ6IHN0cmluZztcbn07XG5cbmF3YWl0IHRhZyhwLCAndicgKyBwYWNrYWdlSnNvbi52ZXJzaW9uKTtcblxuY29uc3QgeyBnaXRIZWFkLCAuLi5oZWFkbGVzcyB9ID0gcGFja2FnZUpzb247XG5hd2FpdCB3cml0ZUZpbGUoXG4gIGpvaW4ocCwgJ3BhY2thZ2UuanNvbicpLFxuICBKU09OLnN0cmluZ2lmeShoZWFkbGVzcywgdW5kZWZpbmVkLCAnICAnKSArICdcXG4nLFxuICAndXRmLTgnXG4pO1xuXG5hd2FpdCBwdXNoKHApO1xuYXdhaXQgcHVzaFRhZ3MocCk7XG4iXX0=