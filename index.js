
import React, {
  Component,
} from 'react'

import {
  WebView,
  Platform,
} from 'react-native'

import WKWebView from 'react-native-wkwebview-reborn'

const isIos = Platform.OS === 'ios'

const script = `
window.sendMessage = function (str) {
  if (str && typeof str === 'object') {
    str = JSON.stringify(str);
  }
  if (${isIos}) {
    str = encodeURIComponent(str);
  }
  postMessage(str);
};
document.addEventListener('message', function (event) {
  var data = event.data;
  if (${isIos}) {
    data = decodeURIComponent(data);
  }
  if (data.indexOf('{') === 0 && data.lastIndexOf('}') === data.length - 1) {
    try {
      data = JSON.parse(data);
    }
    catch (error) {
      sendMessage('json parse error: ' + data);
      return;
    }
  }
  receiveMessage && receiveMessage(data);
});
`

const WebViewComponent = isIos ? WKWebView : WebView

export default class PureWebView extends Component {

  static propTypes = WebView.propTypes

  handleMessage = event => {

    let { onMessage } = this.props
    if (onMessage) {

      let { data } = event.nativeEvent

      if (isIos) {
        data = decodeURIComponent(data)
      }

      if (data.indexOf('{') === 0 && data.lastIndexOf('}') === data.length - 1) {
        try {
          data = JSON.parse(data)
        }
        catch (error) {
          console.log(data, error)
          return
        }
      }

      onMessage(data)

    }

  }

  postMessage(str) {
    if (str && typeof str === 'object') {
      str = JSON.stringify(str)
    }
    this.refs.webview.postMessage(
      isIos ? encodeURIComponent(str) : str
    )
  }

  render() {
    return (
      <WebViewComponent
        {...this.props}
        ref="webview"
        injectedJavaScript={script}
        allowsInlineMediaPlayback={true}
        hideKeyboardAccessoryView={true}
        onMessage={this.handleMessage}
      />
    )
  }

}
