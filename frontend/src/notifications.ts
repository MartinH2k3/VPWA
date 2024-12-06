import { AppVisibility, Notify } from 'quasar';



interface NotifyOptions {
  type?: 'positive' | 'negative' | 'warning' | 'info' | 'ongoing',
  timeout?: number,
  action?: Function;
  color?: string,
  textColor?: string,
  icon?: string,
  detail?: string,
}


const defaultOptions: NotifyOptions = {
  type: 'info',
  timeout: 5000,
  action: () => { },
  color: 'primary',
  textColor: 'white',
  icon: 'favicon.ico',
  detail: '',
};


export function notify(message: string, options?: NotifyOptions) {
  options = { ...defaultOptions, ...options };

  if (!(AppVisibility.appVisible)) {
    const notification = new Notification(message, {
      body: options.detail,
      icon: options.icon,
    });

    notification.onclick = () => {
      if (options.action) options.action();
    };
  }


  Notify.create({
    message: message,
    type: options.type,
    timeout: options.timeout,
    // actions: options.actions,
    color: options.color,
    textColor: options.textColor,
    icon: options.icon,
  });

}






