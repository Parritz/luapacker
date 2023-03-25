import fs from "fs";
import path from "path";
import chalk from "chalk";

const { stdin, stdout } = process;
export default {
	success(message: string): void {
		console.log(chalk.green("[SUCCESS]: ") + message);
	},

	log(message: string): void {
		console.log(chalk.blue("[INFO]: ") + message);
	},

	warn(message: string): void {
		console.log(chalk.yellow("[WARNING]: ") + message);
	},

	error(message: string): void {
		console.log(chalk.red("[ERROR]: ") + message);
	},

	stringToByteArray(String: string) {
		const result = new Uint8Array(String.length);
		for (let i = 0; i < String.length; i++){
			result[i] = String.charCodeAt(i);
		}
		return result;
	},

	async prompt(question: string): Promise<string> {
		return await new Promise((resolve, reject) => {
			stdin.resume();
			stdout.write(question);

			stdin.on("data", data => resolve(data.toString().trim()));
			stdin.on("error", err => reject(err));
		}) as unknown as string;
	},

	// If no extension is passed in the directory string, check the user's directory for files with that name to find the appropriate extension.
	async addExtension(directory: string, extensions: string[]): Promise<string> {
		let hasExtension = false;
		for (const extension of extensions) {
			if (directory.endsWith(extension)) {
				hasExtension = true;
				break;
			}
		}
		
		if (!hasExtension) {
			for (const extension of extensions) {
				if (fs.existsSync(directory + extension)) {
					directory += extension;
					break;
				}
			}
		}
		return directory;
	},

	async retrieveFiles(directory: string, extensions?: string[]): Promise<string[]> {
		const files: string[] = [];
		fs.readdirSync(directory).forEach(async (file) => {
			const isDirectory = fs.lstatSync(path.join(directory, file)).isDirectory();
			const extension = path.extname(file);
			if (!extensions && !isDirectory) files.push(path.resolve(path.join(directory, file)));
			if (extensions && extensions.includes(extension)) {
				files.push(path.resolve(path.join(directory, file)));
			}
	
			// Walk through subdirectories and add any files matching the wanted extensions to the list.
			if (isDirectory) {
				const filesInDir = await this.retrieveFiles(path.join(directory, file), extensions);
				files.push(...filesInDir);
			}
		});
		return files;
	},

	async retrieveDirectories(directory: string): Promise<string[]> {
		const directories: string[] = [];
		fs.readdirSync(directory).forEach(async (file) => {
			const isDirectory = fs.lstatSync(path.join(directory, file)).isDirectory();
			if (isDirectory) directories.push(path.resolve(path.join(directory, file)));
	
			// Walk through subdirectories and add any directories found.
			if (fs.lstatSync(path.join(directory, file)).isDirectory()) {
				const dirs = await this.retrieveDirectories(path.join(directory, file));
				directories.push(...dirs);
			}
		});
		return directories;
	}
};