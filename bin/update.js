import { update } from '../lib/env.js';
const targetDir = process.argv[2] ?? process.env.INIT_CWD;
if (!targetDir) {
    throw new Error('Please specify target directory.');
}
await update(targetDir);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXBkYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFdkMsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUUxRCxJQUFJLENBQUMsU0FBUyxFQUFFO0lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO0NBQ3JEO0FBRUQsTUFBTSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1cGRhdGUgfSBmcm9tICcuLi9saWIvZW52LmpzJztcblxuY29uc3QgdGFyZ2V0RGlyID0gcHJvY2Vzcy5hcmd2WzJdID8/IHByb2Nlc3MuZW52LklOSVRfQ1dEO1xuXG5pZiAoIXRhcmdldERpcikge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBzcGVjaWZ5IHRhcmdldCBkaXJlY3RvcnkuJyk7XG59XG5cbmF3YWl0IHVwZGF0ZSh0YXJnZXREaXIpO1xuIl19