import React from "react";
import { Provider } from "./store";
import { Switch, HashRouter, Route } from "react-router-dom";
import Menu from "./components/MenuEx";
import StatusBar from "./components/StatusBar";
import Map from "./views/Map";
import Audio from "./views/Audio";
import codec from "./codec";
import Sprite from "./views/Sprite";
import Effect from "./views/Effect";
import Action from "./views/Action";

export default () => {
  window.onbeforeunload = (e: any) => {
    codec.terminate();
  };
  return (
    <div>
      <Provider>
        <HashRouter>
          <Menu />

          <Switch>
            <Route path="/action" component={Action} />
            <Route path="/effect" component={Effect} />
            <Route path="/sprite" component={Sprite} />
            <Route path="/audio" component={Audio} />
            <Route component={Map} />
          </Switch>
          <StatusBar />
        </HashRouter>
      </Provider>
    </div>
  );
};
