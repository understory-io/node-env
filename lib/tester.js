import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
let proc;
export async function test(_reporter, path, testFiles, changed) {
    proc?.kill('SIGTERM');
    proc = undefined;
    if (changed.length === 0) {
        return true;
    }
    if (changed.every((file) => dirname(file) === 'test')) {
        testFiles = testFiles.filter((file) => changed.includes(join('test', basename(file, '.js') + '.ts')));
    }
    if (testFiles.length === 0) {
        return true;
    }
    const hooks = await getHooks(path);
    const options = {
        cwd: path,
        stdio: [process.stdin, process.stdout, process.stderr, 'pipe'],
    };
    const exitCode = await new Promise((resolve, reject) => {
        proc = spawn('node', [
            'node_modules/mocha/bin/mocha.js',
            '--parallel',
            '--jobs',
            '128',
            '--require',
            'source-map-support/register',
            ...hooks.flatMap((d) => ['--require', d]),
            ...testFiles,
        ], options);
        const onError = (error) => {
            reject(error);
            proc?.removeListener('error', onError);
            proc?.removeListener('exit', onExit);
            proc = undefined;
        };
        const onExit = (code) => {
            resolve(code);
            proc?.removeListener('error', onError);
            proc?.removeListener('exit', onExit);
            proc = undefined;
        };
        proc.addListener('error', onError);
        proc.addListener('exit', onExit);
    });
    return exitCode === 0;
}
async function getHooks(path) {
    const { dependencies } = JSON.parse(await readFile(join(path, 'package.json'), 'utf-8'));
    if (!dependencies) {
        return [];
    }
    const hooks = await Promise.all(Object.keys(dependencies).map(async (dependency) => {
        const { mock } = JSON.parse(await readFile(join(path, 'node_modules', dependency, 'package.json'), 'utf-8'));
        if (!mock) {
            return '';
        }
        return `${dependency}/${mock}`;
    }));
    return hooks.filter((h) => !!h);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGVzdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBZ0IsS0FBSyxFQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFHcEQsSUFBSSxJQUE4QixDQUFDO0FBRW5DLE1BQU0sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUN4QixTQUFtQixFQUNuQixJQUFZLEVBQ1osU0FBbUIsRUFDbkIsT0FBaUI7SUFFakIsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0QixJQUFJLEdBQUcsU0FBUyxDQUFDO0lBQ2pCLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDeEIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLE1BQU0sQ0FBQyxFQUFFO1FBQ3JELFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FDcEMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FDOUQsQ0FBQztLQUNIO0lBQ0QsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUMxQixPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsTUFBTSxLQUFLLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkMsTUFBTSxPQUFPLEdBQWlCO1FBQzVCLEdBQUcsRUFBRSxJQUFJO1FBQ1QsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO0tBQy9ELENBQUM7SUFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksT0FBTyxDQUFnQixDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNwRSxJQUFJLEdBQUcsS0FBSyxDQUNWLE1BQU0sRUFDTjtZQUNFLGlDQUFpQztZQUNqQyxZQUFZO1lBQ1osUUFBUTtZQUNSLEtBQUs7WUFDTCxXQUFXO1lBQ1gsNkJBQTZCO1lBQzdCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekMsR0FBRyxTQUFTO1NBQ2IsRUFDRCxPQUFPLENBQ1IsQ0FBQztRQUNGLE1BQU0sT0FBTyxHQUFHLENBQUMsS0FBWSxFQUFFLEVBQUU7WUFDL0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2QsSUFBSSxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDdkMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckMsSUFBSSxHQUFHLFNBQVMsQ0FBQztRQUNuQixDQUFDLENBQUM7UUFDRixNQUFNLE1BQU0sR0FBRyxDQUFDLElBQW1CLEVBQUUsRUFBRTtZQUNyQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZCxJQUFJLEVBQUUsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN2QyxJQUFJLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ25CLENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxRQUFRLEtBQUssQ0FBQyxDQUFDO0FBQ3hCLENBQUM7QUFFRCxLQUFLLFVBQVUsUUFBUSxDQUFDLElBQVk7SUFDbEMsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQ2pDLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBR3BELENBQUM7SUFDRixJQUFJLENBQUMsWUFBWSxFQUFFO1FBQ2pCLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFBRTtRQUNqRCxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDekIsTUFBTSxRQUFRLENBQ1osSUFBSSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxFQUN0RCxPQUFPLENBQ1IsQ0FHRixDQUFDO1FBQ0YsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFDRCxPQUFPLEdBQUcsVUFBVSxJQUFJLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUNILENBQUM7SUFDRixPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hpbGRQcm9jZXNzLCBzcGF3biwgU3Bhd25PcHRpb25zIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IHJlYWRGaWxlIH0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgam9pbiB9IGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgeyBSZXBvcnRlciB9IGZyb20gJy4vcmVwb3J0ZXIuanMnO1xuXG5sZXQgcHJvYzogQ2hpbGRQcm9jZXNzIHwgdW5kZWZpbmVkO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGVzdChcbiAgX3JlcG9ydGVyOiBSZXBvcnRlcixcbiAgcGF0aDogc3RyaW5nLFxuICB0ZXN0RmlsZXM6IHN0cmluZ1tdLFxuICBjaGFuZ2VkOiBzdHJpbmdbXVxuKSB7XG4gIHByb2M/LmtpbGwoJ1NJR1RFUk0nKTtcbiAgcHJvYyA9IHVuZGVmaW5lZDtcbiAgaWYgKGNoYW5nZWQubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGNoYW5nZWQuZXZlcnkoKGZpbGUpID0+IGRpcm5hbWUoZmlsZSkgPT09ICd0ZXN0JykpIHtcbiAgICB0ZXN0RmlsZXMgPSB0ZXN0RmlsZXMuZmlsdGVyKChmaWxlKSA9PlxuICAgICAgY2hhbmdlZC5pbmNsdWRlcyhqb2luKCd0ZXN0JywgYmFzZW5hbWUoZmlsZSwgJy5qcycpICsgJy50cycpKVxuICAgICk7XG4gIH1cbiAgaWYgKHRlc3RGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zdCBob29rcyA9IGF3YWl0IGdldEhvb2tzKHBhdGgpO1xuICBjb25zdCBvcHRpb25zOiBTcGF3bk9wdGlvbnMgPSB7XG4gICAgY3dkOiBwYXRoLFxuICAgIHN0ZGlvOiBbcHJvY2Vzcy5zdGRpbiwgcHJvY2Vzcy5zdGRvdXQsIHByb2Nlc3Muc3RkZXJyLCAncGlwZSddLFxuICB9O1xuICBjb25zdCBleGl0Q29kZSA9IGF3YWl0IG5ldyBQcm9taXNlPG51bWJlciB8IG51bGw+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBwcm9jID0gc3Bhd24oXG4gICAgICAnbm9kZScsXG4gICAgICBbXG4gICAgICAgICdub2RlX21vZHVsZXMvbW9jaGEvYmluL21vY2hhLmpzJyxcbiAgICAgICAgJy0tcGFyYWxsZWwnLFxuICAgICAgICAnLS1qb2JzJyxcbiAgICAgICAgJzEyOCcsXG4gICAgICAgICctLXJlcXVpcmUnLFxuICAgICAgICAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJyxcbiAgICAgICAgLi4uaG9va3MuZmxhdE1hcCgoZCkgPT4gWyctLXJlcXVpcmUnLCBkXSksXG4gICAgICAgIC4uLnRlc3RGaWxlcyxcbiAgICAgIF0sXG4gICAgICBvcHRpb25zXG4gICAgKTtcbiAgICBjb25zdCBvbkVycm9yID0gKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgIHByb2M/LnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgICAgcHJvYz8ucmVtb3ZlTGlzdGVuZXIoJ2V4aXQnLCBvbkV4aXQpO1xuICAgICAgcHJvYyA9IHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIGNvbnN0IG9uRXhpdCA9IChjb2RlOiBudW1iZXIgfCBudWxsKSA9PiB7XG4gICAgICByZXNvbHZlKGNvZGUpO1xuICAgICAgcHJvYz8ucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICBwcm9jPy5yZW1vdmVMaXN0ZW5lcignZXhpdCcsIG9uRXhpdCk7XG4gICAgICBwcm9jID0gdW5kZWZpbmVkO1xuICAgIH07XG4gICAgcHJvYy5hZGRMaXN0ZW5lcignZXJyb3InLCBvbkVycm9yKTtcbiAgICBwcm9jLmFkZExpc3RlbmVyKCdleGl0Jywgb25FeGl0KTtcbiAgfSk7XG4gIHJldHVybiBleGl0Q29kZSA9PT0gMDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0SG9va3MocGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IHsgZGVwZW5kZW5jaWVzIH0gPSBKU09OLnBhcnNlKFxuICAgIGF3YWl0IHJlYWRGaWxlKGpvaW4ocGF0aCwgJ3BhY2thZ2UuanNvbicpLCAndXRmLTgnKVxuICApIGFzIHtcbiAgICBkZXBlbmRlbmNpZXM/OiB7IFtwOiBzdHJpbmddOiB1bmtub3duIH07XG4gIH07XG4gIGlmICghZGVwZW5kZW5jaWVzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGhvb2tzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgT2JqZWN0LmtleXMoZGVwZW5kZW5jaWVzKS5tYXAoYXN5bmMgKGRlcGVuZGVuY3kpID0+IHtcbiAgICAgIGNvbnN0IHsgbW9jayB9ID0gSlNPTi5wYXJzZShcbiAgICAgICAgYXdhaXQgcmVhZEZpbGUoXG4gICAgICAgICAgam9pbihwYXRoLCAnbm9kZV9tb2R1bGVzJywgZGVwZW5kZW5jeSwgJ3BhY2thZ2UuanNvbicpLFxuICAgICAgICAgICd1dGYtOCdcbiAgICAgICAgKVxuICAgICAgKSBhcyB7XG4gICAgICAgIG1vY2s6IHN0cmluZztcbiAgICAgIH07XG4gICAgICBpZiAoIW1vY2spIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGAke2RlcGVuZGVuY3l9LyR7bW9ja31gO1xuICAgIH0pXG4gICk7XG4gIHJldHVybiBob29rcy5maWx0ZXIoKGgpID0+ICEhaCk7XG59XG4iXX0=