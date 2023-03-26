import { PluginResponseType, type Plugin as Plugin } from '../Types.svelte'
import { emailPasswordStorage } from '../Storage.svelte'
import { get } from 'svelte/store'

const SENDMAIL_URL = "http://127.0.0.1:3124/plugins/mail/send"

export const emailPlugin: Plugin = {
  name: "Email",
  plugin:
    "## email:\n### send:\nUse this plugin action to send a email to someone using the following format:\n`plugins.email.send <receiver>:: <subject>::\n<content>`\n#### response:\nThe plugin will respond with the status code.\n`plugins.email.send.response <status_code>`,\n",
  explanation:
    '## email:\n### me:\nCan you send the text to `mymomisepicness@icloud.com` with a fitting subject? Text:\nHi, can you go to the park with me tommorow on 15:30?\nIlay Hamer.\n### you:\nSending your email: ```plugins.email.send mymomisepicness@icloud.com:: Can you go to the park tommorow?::\nHi, can you go to the park with me tommorow on 15:30?\nIlay Hamer.```.\n### plugin:\nSending your email: `plugins.email.send.response success`.\n### you:\nSending your email: success!',
  async receive(input) {
    const results = [...input.matchAll(/\`*.plugins.*[`|```]/gs)][0]
    if (!results || results.length == 0) {
      console.log("ingore")
      return { type: PluginResponseType.IGNORE, message: "" }
    }
    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      let result_tmp = result.replaceAll("`", "")
      const command = result_tmp.split(" ")[0]
      if (command == "plugins.email.send") {
        result_tmp = result_tmp.replace(command, "")
        const splitted = result_tmp.split("::")
        console.log(splitted)
        const email = get(emailPasswordStorage)

        const response = await fetch(SENDMAIL_URL, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*"
          },
          body: JSON.stringify({ content: splitted[2], subject: splitted[1], receiver: splitted[0], from: email.email, password: email.password, service: email.service })
        })
        let message: any
        try {
          message = await response.json()
        } catch (error) {
          input = input.replace(result, "`plugins.email.send.response " + "failed" + "`")
          return { type: PluginResponseType.ADD, message: "### Plugin:\n" + input }
        }
        console.log(message)

        input = input.replace(result, "`plugins.email.send.response " + message.message + "`")
      }
    }

    return { type: PluginResponseType.ADD, message: "### Plugin:\n" + input }
  },
}