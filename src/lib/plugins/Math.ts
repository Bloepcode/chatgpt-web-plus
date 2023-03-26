import { evaluate, round } from 'mathjs'
import { PluginResponseType, type Plugin as Plugin } from '../Types.svelte'

export const mathPlugin: Plugin = {
  name: "Math",
  plugin: "## math:\n### simple:\nEvery time you need to do simple math such as subtraction and multiplication, use the following format:\n`plugins.math.simple <equation (example: `3-(43/5)`)>`\n### round:\nIf you need to round a number, use the following format:\n`plugins.math.round <number or equation (example: `4.23954`)>: <digits (example: `2`)>`',\n  plugin_features: 'send emails',\n  plugin_instructions: 'If I ask you to send an email, you will need to respond like this:\n```\nsubject:<subject>\nContent:\n<content>\nNormal response:\n<normal response>\n```",
  explanation: '## math:\n### me:\nwhat is 6 + 4? And what is 32 plus 5.3 divided by 4 rounded to 2 digits?\n### you:\n6 plus 4 is `plugins.math.simple 6 + 4` and he answer to 32 plus 5.3 divided by 4 rounded to one digit is `plugins.math.round 32 + 5.3 / 4: 2`',
  async receive(input) {
    const results = [...input.matchAll(/\`*.plugins.*[`|```]/gs)][0]
    if (results.length == 0) {
      console.log("ingore")
      return { type: PluginResponseType.IGNORE, message: "" }
    }
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      let result_tmp = result.replaceAll("`", "")
      const command = result_tmp.split(" ")[0]
      if (command == "plugins.math.simple") {
        result_tmp = result_tmp.replace(command, "")
        console.log(result_tmp)
        input = input.replace(result, evaluate(result_tmp))
      } else if (command == "plugins.math.round") {
        result_tmp = result_tmp.replace(command, "")
        const splitted = result_tmp.split(": ")
        input = input.replace(result, round(evaluate(splitted[0]), parseInt(splitted[1])))

      }
    }
    return { type: PluginResponseType.REPLACE, message: input }
  },
}
