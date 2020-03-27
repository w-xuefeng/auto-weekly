const fs = require('fs')
const xlsx = require('node-xlsx')
// const xlsxStyle = require('xlsx-style')
const config = require('./config.json')
const { summary, nameRules, dailyPath, sheet } = config

const readFileName = (dir) => {
  let components = []
  const files = fs.readdirSync(dir)
  files.forEach(item => {
    const subDir = `${dir}/${item}`
    const stat = fs.lstatSync(subDir)    
    if (stat.isDirectory() === true) {
      components.push(readFileName(subDir))
    } else {
      components.push({
        path: `${dir}/${item}`,
        item
      })
    }
  })
  return components
}

const getParam = (str) => {
  const matchRst = str.match(/\{\{(.+?)\}\}/g)
  return matchRst && matchRst.map(e => {
    const { groups = null } = e.match(/\{\{\s*(?<param>(.+?))\s*\}\}/)
    if (groups && groups.param) {
      return groups.param
    } else {
      return null
    }
  }) || str
}

const getDateStr = (AddDayCount) => {
  const from = getParam(summary.from)
  const dd = from.includes('_date.from') ? new Date() : new Date(from)
  dd.setDate(dd.getDate() + AddDayCount)
  const year = dd.getFullYear()
  const mon = dd.getMonth() + 1
  const day = dd.getDate()
  return year + '-' + (mon < 10 ? ('0' + mon) : mon) + '-' + (day < 10 ? ('0' + day) : day)
}

const getDateList = () => {
  return new Array(summary.weekday).fill(null, 0, summary.weekday).map((e, i) => getDateStr(-i))
}

const readFile = () => {
  const dateList = getDateList()
  console.log("周总结日期：")
  console.log(dateList)
  return readFileName(dailyPath).map(e => {
    if (e.item.match(nameRules) && e.item.match(nameRules)) {
      return {
        ...e,
        ...e.item.match(nameRules).groups
      }
    } else {
      return e
    }
  }).filter((e) => {
    return (e.date && dateList.includes(e.date))
  })
}

const readExcel = (files, _date) => {
  const obj = xlsx.parse(files.path)
  const excelObj = obj[0].data
  const summaryTitle = getParam(summary.title)
  const summaryContent = getParam(summary.content)
  const [rowp, colp] = sheet.project
  const [rowc, colc] = sheet.content
  const project = excelObj[rowp][colp]
  const content = excelObj[rowc][colc]
  const _nameRules = files
  const _sheet = { project, content }
  const title = summaryTitle.reduce((t, cv) => [...t, cv.startsWith('_') ? eval(cv) : cv], []).join(" ")
  const contents = summaryContent.reduce((t, cv) => [...t, cv.startsWith('_') ? eval(cv) : cv], []).join(" ")
  const outputName = getParam(summary.outputName).reduce((t, cv) => [...t, cv.startsWith('_') ? eval(cv) : cv], []).join("")
  const output = `${summary.outputDir}/${outputName}`
  return { title, content: contents, output, outputName}
}

const writeFile = (finalData, finalDataString, fileExt) => {
  summary.outputEnable && (fs.existsSync(summary.outputDir) || fs.mkdir(summary.outputDir, err => {
    if (err) throw err
    fs.writeFileSync(`${finalData[0].output}${fileExt}`, finalDataString)
  })) && fs.writeFileSync(`${finalData[0].output}${fileExt}`, finalDataString)
}

const output = () => {
  const files = readFile()
  const _date = { from: files[0].date, to: files[files.length - 1].date }
  const finalData = files.map(e => readExcel(e, _date))
  let finalDataString = null
  if (summary.outputExt.includes('.json')) {
    finalDataString = JSON.stringify(finalData.map(e => ({ title: e.title, content: e.content })), null, 2)
    writeFile(finalData, finalDataString, '.json')
  }
  if (summary.outputExt.includes('.txt')) {
    finalDataString = finalData.map(e => (`${e.title}\r\n${e.content}`)).join('\r\n\r\n')
    writeFile(finalData, finalDataString, '.txt')
  }
  if (summary.outputExt.includes('.xlsx')) {
    const data = [
      ['时间/项目', '工作内容']
    ];
    for (let item of finalData) {
      data.push([item.title, item.content])
    }
    const buffer = xlsx.build([{ name: finalData[0].outputName, data }]);
    summary.outputEnable && (fs.existsSync(summary.outputDir) || fs.mkdir(summary.outputDir, err => {
      if (err) throw err
      fs.writeFileSync(`${finalData[0].output}${'.xlsx'}`, buffer, { 'flag': 'w' })
    })) && fs.writeFileSync(`${finalData[0].output}${'.xlsx'}`, buffer, { 'flag': 'w' })
  }
  if (summary.showInCMD) {
    console.log("周总结内容如下：")
    console.log(finalDataString || finalData)
  }
}

output()