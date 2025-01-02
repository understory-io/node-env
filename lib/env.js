import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, rm, stat, unlink, writeFile, } from 'node:fs/promises';
import { EOL } from 'node:os';
import { join } from 'node:path';
import { vote } from './siblings.js';
const dirs = ['.vscode', '.idea/codeStyles/', '.idea/inspectionProfiles/'];
const files = [
    '.editorconfig',
    'eslint.config.js',
    '.prettierrc.cjs',
    'tsconfig.json',
    '.vscode/settings.json',
    '.vscode/extensions.json',
    '.idea/compiler.xml',
    '.idea/codeStyles/codeStyleConfig.xml',
    '.idea/inspectionProfiles/Project_Default.xml',
];
const overridableFiles = [];
const legacyFiles = ['.prettierrc', '.prettierrc.json', '.eslintrc.json'];
export async function prepare() {
    await rm('template', { recursive: true, force: true });
    await mkdir('template');
    await Promise.all(dirs.map((dir) => mkdir(join('template', dir), { recursive: true })));
    await Promise.all([...files, ...overridableFiles.map((f) => f[0])].map((file) => {
        if (!existsSync(file)) {
            copyFile(file, join('template', file));
        }
    }));
    await writeFile('template/gitignore', (await readFile('.gitignore', 'utf-8'))
        .split('\n')
        .filter((l) => !!l && l !== 'template/')
        .concat(...files, '')
        .join('\n'));
}
export async function setup(targetDir) {
    await Promise.all(legacyFiles.map((file) => ensureUnlinked(join(targetDir, file))));
    await Promise.all(dirs.map((dir) => mkdir(join(targetDir, dir), { recursive: true })));
    await Promise.all(files.map((file) => copyFile(join('template', file), join(targetDir, file))));
    if (!targetDir.endsWith(join('riddance', 'node-env'))) {
        await copyFile('template/gitignore', join(targetDir, '.gitignore'));
    }
    for (const [file, belongsHere] of overridableFiles) {
        try {
            const existing = await readFile(join(targetDir, file), 'utf-8');
            if (!belongsHere(existing)) {
                continue;
            }
        }
        catch (e) {
            if (!isFileNotFound(e)) {
                throw e;
            }
        }
        await copyFile(join('template', file), join(targetDir, file));
    }
    await syncGitUser(targetDir);
    await makeWindowsDevcontainerFriendly(targetDir);
}
async function syncGitUser(path) {
    try {
        const [ws, core, ...sections] = (await readFile(join(path, '.git/config'), 'utf-8'))
            .split('[')
            .map((s) => '[' + s);
        if (!ws || !core || sections[0]?.startsWith('[user]')) {
            return;
        }
        const user = await vote(path, '.git/config', (content) => '[' +
            content
                .split('[')
                .filter((section) => section.startsWith('user]'))
                .join('['));
        if (!user) {
            return;
        }
        await writeFile(join(path, '.git/config'), [ws.substring(1), core, user, ...sections].join(''), 'utf-8');
    }
    catch (e) {
        if (isFileNotFound(e)) {
            return;
        }
        throw e;
    }
}
async function makeWindowsDevcontainerFriendly(targetDir) {
    if (!(await stat(join(targetDir, '.gitattributes')).catch(isFileNotFound))) {
        return;
    }
    await writeFile(join(targetDir, '.gitattributes'), '* text=auto eol=lf\n');
    await forEachSourceFile(targetDir, async (path) => {
        await writeFile(path, (await readFile(path, 'utf-8')).replaceAll(EOL, '\n'), 'utf-8');
    });
}
export async function update(targetDir) {
    await ensureUnlinked(join(targetDir, '.timestamps.json'));
}
async function forEachSourceFile(path, fn) {
    const entries = await readdir(path, { withFileTypes: true });
    await Promise.all(entries.map(async (entry) => {
        if (entry.isDirectory() && entry.name !== 'node_modules') {
            await forEachSourceFile(join(path, entry.name), fn);
        }
        if ((entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) ||
            entry.name.endsWith('.json')) {
            await fn(join(path, entry.name));
        }
    }));
}
async function ensureUnlinked(path) {
    try {
        await unlink(path);
    }
    catch (e) {
        if (isFileNotFound(e)) {
            return;
        }
        throw e;
    }
}
function isFileNotFound(e) {
    return e.code === 'ENOENT';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZW52LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDckMsT0FBTyxFQUNMLFFBQVEsRUFDUixLQUFLLEVBQ0wsT0FBTyxFQUNQLFFBQVEsRUFDUixFQUFFLEVBQ0YsSUFBSSxFQUNKLE1BQU0sRUFDTixTQUFTLEdBQ1YsTUFBTSxrQkFBa0IsQ0FBQztBQUMxQixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQzlCLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDakMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyQyxNQUFNLElBQUksR0FBRyxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0FBQzNFLE1BQU0sS0FBSyxHQUFHO0lBQ1osZUFBZTtJQUNmLGtCQUFrQjtJQUNsQixpQkFBaUI7SUFDakIsZUFBZTtJQUNmLHVCQUF1QjtJQUN2Qix5QkFBeUI7SUFDekIsb0JBQW9CO0lBQ3BCLHNDQUFzQztJQUN0Qyw4Q0FBOEM7Q0FDL0MsQ0FBQztBQUNGLE1BQU0sZ0JBQWdCLEdBQTZDLEVBQUUsQ0FBQztBQUN0RSxNQUFNLFdBQVcsR0FBRyxDQUFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTFFLE1BQU0sQ0FBQyxLQUFLLFVBQVUsT0FBTztJQUMzQixNQUFNLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hCLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FDZixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxL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aUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDckQ7UUFDRCxJQUNFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3RCxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFDNUI7WUFDQSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO0lBQ0gsQ0FBQyxDQUFDLENBQ0gsQ0FBQztBQUNKLENBQUM7QUFFRCxLQUFLLFVBQVUsY0FBYyxDQUFDLElBQVk7SUFDeEMsSUFBSTtRQUNGLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3BCO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNyQixPQUFPO1NBQ1I7UUFDRCxNQUFNLENBQUMsQ0FBQztLQUNUO0FBQ0gsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLENBQVU7SUFDaEMsT0FBUSxDQUF1QixDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7QUFDcEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4aXN0c1N5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCB7XG4gIGNvcHlGaWxlLFxuICBta2RpcixcbiAgcmVhZGRpcixcbiAgcmVhZEZpbGUsXG4gIHJtLFxuICBzdGF0LFxuICB1bmxpbmssXG4gIHdyaXRlRmlsZSxcbn0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5pbXBvcnQgeyBFT0wgfSBmcm9tICdub2RlOm9zJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdub2RlOnBhdGgnO1xuaW1wb3J0IHsgdm90ZSB9IGZyb20gJy4vc2libGluZ3MuanMnO1xuXG5jb25zdCBkaXJzID0gWycudnNjb2RlJywgJy5pZGVhL2NvZGVTdHlsZXMvJywgJy5pZGVhL2luc3BlY3Rpb25Qcm9maWxlcy8nXTtcbmNvbnN0IGZpbGVzID0gW1xuICAnLmVkaXRvcmNvbmZpZycsXG4gICdlc2xpbnQuY29uZmlnLmpzJyxcbiAgJy5wcmV0dGllcnJjLmNqcycsXG4gICd0c2NvbmZpZy5qc29uJyxcbiAgJy52c2NvZGUvc2V0dGluZ3MuanNvbicsXG4gICcudnNjb2RlL2V4dGVuc2lvbnMuanNvbicsXG4gICcuaWRlYS9jb21waWxlci54bWwnLFxuICAnLmlkZWEvY29kZVN0eWxlcy9jb2RlU3R5bGVDb25maWcueG1sJyxcbiAgJy5pZGVhL2luc3BlY3Rpb25Qcm9maWxlcy9Qcm9qZWN0X0RlZmF1bHQueG1sJyxcbl07XG5jb25zdCBvdmVycmlkYWJsZUZpbGVzOiBbc3RyaW5nLCAoY29udGVudDogc3RyaW5nKSA9PiBib29sZWFuXVtdID0gW107XG5jb25zdCBsZWdhY3lGaWxlcyA9IFsnLnByZXR0aWVycmMnLCAnLnByZXR0aWVycmMuanNvbicsICcuZXNsaW50cmMuanNvbiddO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJlcGFyZSgpIHtcbiAgYXdhaXQgcm0oJ3RlbXBsYXRlJywgeyByZWN1cnNpdmU6IHRydWUsIGZvcmNlOiB0cnVlIH0pO1xuICBhd2FpdCBta2RpcigndGVtcGxhdGUnKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgZGlycy5tYXAoKGRpcikgPT4gbWtkaXIoam9pbigndGVtcGxhdGUnLCBkaXIpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KSlcbiAgKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgWy4uLmZpbGVzLCAuLi5vdmVycmlkYWJsZUZpbGVzLm1hcCgoZikgPT4gZlswXSldLm1hcCgoZmlsZSkgPT4ge1xuICAgICAgaWYgKCFleGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICAgIGNvcHlGaWxlKGZpbGUsIGpvaW4oJ3RlbXBsYXRlJywgZmlsZSkpO1xuICAgICAgfVxuICAgIH0pXG4gICk7XG4gIGF3YWl0IHdyaXRlRmlsZShcbiAgICAndGVtcGxhdGUvZ2l0aWdub3JlJyxcbiAgICAoYXdhaXQgcmVhZEZpbGUoJy5naXRpZ25vcmUnLCAndXRmLTgnKSlcbiAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgIC5maWx0ZXIoKGwpID0+ICEhbCAmJiBsICE9PSAndGVtcGxhdGUvJylcbiAgICAgIC5jb25jYXQoLi4uZmlsZXMsICcnKVxuICAgICAgLmpvaW4oJ1xcbicpXG4gICk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXR1cCh0YXJnZXREaXI6IHN0cmluZykge1xuICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBsZWdhY3lGaWxlcy5tYXAoKGZpbGUpID0+IGVuc3VyZVVubGlua2VkKGpvaW4odGFyZ2V0RGlyLCBmaWxlKSkpXG4gICk7XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGRpcnMubWFwKChkaXIpID0+IG1rZGlyKGpvaW4odGFyZ2V0RGlyLCBkaXIpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KSlcbiAgKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgZmlsZXMubWFwKChmaWxlKSA9PiBjb3B5RmlsZShqb2luKCd0ZW1wbGF0ZScsIGZpbGUpLCBqb2luKHRhcmdldERpciwgZmlsZSkpKVxuICApO1xuICBpZiAoIXRhcmdldERpci5lbmRzV2l0aChqb2luKCdyaWRkYW5jZScsICdub2RlLWVudicpKSkge1xuICAgIGF3YWl0IGNvcHlGaWxlKCd0ZW1wbGF0ZS9naXRpZ25vcmUnLCBqb2luKHRhcmdldERpciwgJy5naXRpZ25vcmUnKSk7XG4gIH1cbiAgZm9yIChjb25zdCBbZmlsZSwgYmVsb25nc0hlcmVdIG9mIG92ZXJyaWRhYmxlRmlsZXMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCByZWFkRmlsZShqb2luKHRhcmdldERpciwgZmlsZSksICd1dGYtOCcpO1xuICAgICAgaWYgKCFiZWxvbmdzSGVyZShleGlzdGluZykpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCFpc0ZpbGVOb3RGb3VuZChlKSkge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICBhd2FpdCBjb3B5RmlsZShqb2luKCd0ZW1wbGF0ZScsIGZpbGUpLCBqb2luKHRhcmdldERpciwgZmlsZSkpO1xuICB9XG4gIGF3YWl0IHN5bmNHaXRVc2VyKHRhcmdldERpcik7XG4gIGF3YWl0IG1ha2VXaW5kb3dzRGV2Y29udGFpbmVyRnJpZW5kbHkodGFyZ2V0RGlyKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3luY0dpdFVzZXIocGF0aDogc3RyaW5nKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgW3dzLCBjb3JlLCAuLi5zZWN0aW9uc10gPSAoXG4gICAgICBhd2FpdCByZWFkRmlsZShqb2luKHBhdGgsICcuZ2l0L2NvbmZpZycpLCAndXRmLTgnKVxuICAgIClcbiAgICAgIC5zcGxpdCgnWycpXG4gICAgICAubWFwKChzKSA9PiAnWycgKyBzKTtcbiAgICBpZiAoIXdzIHx8ICFjb3JlIHx8IHNlY3Rpb25zWzBdPy5zdGFydHNXaXRoKCdbdXNlcl0nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgdm90ZShcbiAgICAgIHBhdGgsXG4gICAgICAnLmdpdC9jb25maWcnLFxuICAgICAgKGNvbnRlbnQpID0+XG4gICAgICAgICdbJyArXG4gICAgICAgIGNvbnRlbnRcbiAgICAgICAgICAuc3BsaXQoJ1snKVxuICAgICAgICAgIC5maWx0ZXIoKHNlY3Rpb24pID0+IHNlY3Rpb24uc3RhcnRzV2l0aCgndXNlcl0nKSlcbiAgICAgICAgICAuam9pbignWycpXG4gICAgKTtcbiAgICBpZiAoIXVzZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgd3JpdGVGaWxlKFxuICAgICAgam9pbihwYXRoLCAnLmdpdC9jb25maWcnKSxcbiAgICAgIFt3cy5zdWJzdHJpbmcoMSksIGNvcmUsIHVzZXIsIC4uLnNlY3Rpb25zXS5qb2luKCcnKSxcbiAgICAgICd1dGYtOCdcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGlzRmlsZU5vdEZvdW5kKGUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbWFrZVdpbmRvd3NEZXZjb250YWluZXJGcmllbmRseSh0YXJnZXREaXI6IHN0cmluZykge1xuICBpZiAoIShhd2FpdCBzdGF0KGpvaW4odGFyZ2V0RGlyLCAnLmdpdGF0dHJpYnV0ZXMnKSkuY2F0Y2goaXNGaWxlTm90Rm91bmQpKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF3YWl0IHdyaXRlRmlsZShqb2luKHRhcmdldERpciwgJy5naXRhdHRyaWJ1dGVzJyksICcqIHRleHQ9YXV0byBlb2w9bGZcXG4nKTtcbiAgYXdhaXQgZm9yRWFjaFNvdXJjZUZpbGUodGFyZ2V0RGlyLCBhc3luYyAocGF0aCkgPT4ge1xuICAgIGF3YWl0IHdyaXRlRmlsZShcbiAgICAgIHBhdGgsXG4gICAgICAoYXdhaXQgcmVhZEZpbGUocGF0aCwgJ3V0Zi04JykpLnJlcGxhY2VBbGwoRU9MLCAnXFxuJyksXG4gICAgICAndXRmLTgnXG4gICAgKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGRhdGUodGFyZ2V0RGlyOiBzdHJpbmcpIHtcbiAgYXdhaXQgZW5zdXJlVW5saW5rZWQoam9pbih0YXJnZXREaXIsICcudGltZXN0YW1wcy5qc29uJykpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmb3JFYWNoU291cmNlRmlsZShcbiAgcGF0aDogc3RyaW5nLFxuICBmbjogKHA6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPlxuKSB7XG4gIGNvbnN0IGVudHJpZXMgPSBhd2FpdCByZWFkZGlyKHBhdGgsIHsgd2l0aEZpbGVUeXBlczogdHJ1ZSB9KTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgZW50cmllcy5tYXAoYXN5bmMgKGVudHJ5KSA9PiB7XG4gICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkoKSAmJiBlbnRyeS5uYW1lICE9PSAnbm9kZV9tb2R1bGVzJykge1xuICAgICAgICBhd2FpdCBmb3JFYWNoU291cmNlRmlsZShqb2luKHBhdGgsIGVudHJ5Lm5hbWUpLCBmbik7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIChlbnRyeS5uYW1lLmVuZHNXaXRoKCcudHMnKSAmJiAhZW50cnkubmFtZS5lbmRzV2l0aCgnLmQudHMnKSkgfHxcbiAgICAgICAgZW50cnkubmFtZS5lbmRzV2l0aCgnLmpzb24nKVxuICAgICAgKSB7XG4gICAgICAgIGF3YWl0IGZuKGpvaW4ocGF0aCwgZW50cnkubmFtZSkpO1xuICAgICAgfVxuICAgIH0pXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZVVubGlua2VkKHBhdGg6IHN0cmluZykge1xuICB0cnkge1xuICAgIGF3YWl0IHVubGluayhwYXRoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChpc0ZpbGVOb3RGb3VuZChlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzRmlsZU5vdEZvdW5kKGU6IHVua25vd24pIHtcbiAgcmV0dXJuIChlIGFzIHsgY29kZT86IHN0cmluZyB9KS5jb2RlID09PSAnRU5PRU5UJztcbn1cbiJdfQ==