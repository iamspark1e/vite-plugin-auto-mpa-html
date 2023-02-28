import { globSync } from 'glob'
import path from 'node:path'

function getEntry(): string[] {
    const globPath = 'pages/*/main.js' // 匹配src目录下的所有文件夹中的js文件
    // (\/|\\\\) 这种写法是为了兼容 windows和 mac系统目录路径的不同写法
    const pathDir = 'pages(\/|\\\\)(.*?)(\/|\\\\)' // 路径为src目录下的所有文件夹
    const files = globSync(globPath)
    let dirname; const entries = []
    for (let i = 0; i < files.length; i++) {
        dirname = path.dirname(files[i])
        entries.push(dirname.replace(new RegExp('^' + pathDir), '$2').replace('pages/', ''))
    }
    return entries
}
export default function getEntryKV(): { [key: string]: string } {
    const entryObj: { [key: string]: string } = {}
    getEntry().forEach((item: string) => {
        entryObj[item] = path.resolve(__dirname, '..', '..', item + '.html')
    })
    return entryObj
}