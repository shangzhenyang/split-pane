import { SplitPane } from "./SplitPane";
import classNames from "classnames";
import styles from "../styles/App.module.css";

function App() {
  return (
    <SplitPane>
      <div className={classNames(styles["panel"], styles["yellow"])}>
        Panel 1
      </div>
      <SplitPane>
        <div className={classNames(styles["panel"], styles["yellow"])}>
          Panel 1
        </div>
        <div className={classNames(styles["panel"], styles["blue"])}>
          Panel 2
        </div>
      </SplitPane>
    </SplitPane>
  );
}

export default App;
