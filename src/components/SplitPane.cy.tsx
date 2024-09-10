import { mount } from "cypress/react18";
import { SplitPane } from "./SplitPane";

describe("<SplitPane />", () => {
  const LeftPane = () => <div>Left Pane</div>;
  const RightPane = () => <div>Right Pane</div>;

  it("renders two child components", () => {
    mount(
      <SplitPane>
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.contains("Left Pane").should("exist");
    cy.contains("Right Pane").should("exist");
  });

  it("renders nested SplitPane components", () => {
    mount(
      <SplitPane>
        <div>Pane 1</div>
        <SplitPane>
          <div>Pane 2</div>
          <div>Pane 3</div>
        </SplitPane>
      </SplitPane>,
    );
    cy.contains("Pane 1").should("exist");
    cy.contains("Pane 2").should("exist");
    cy.contains("Pane 3").should("exist");
  });

  it("respects initial size", () => {
    const initialSize = 100;
    mount(
      <SplitPane initialSize={initialSize}>
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width).to.be.equal(initialSize);
    });
  });

  it("respects initial size as number string", () => {
    const initialSize = "100";
    mount(
      <SplitPane initialSize={initialSize}>
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width).to.be.equal(Number(initialSize));
    });
  });

  it("respects initial size as percentage", () => {
    mount(
      <SplitPane initialSize="30%">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "flex-basis",
      "30%",
    );
  });

  it("respects minimum size", () => {
    const minSize = 200;
    mount(
      <SplitPane minSize={minSize}>
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "min-width",
      `${minSize}px`,
    );
  });

  it("respects minimum size as number string", () => {
    const minSize = "200";
    mount(
      <SplitPane minSize={minSize}>
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "min-width",
      `${minSize}px`,
    );
  });

  it("respects minimum size as percentage", () => {
    mount(
      <SplitPane minSize="30%">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "min-width",
      "30%",
    );
  });

  it("respects minimum size when initial size is smaller", () => {
    const initialSize = 100;
    const minSize = 200;
    mount(
      <SplitPane
        initialSize={initialSize}
        minSize={minSize}
      >
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width).to.be.equal(minSize);
    });
  });

  it("allows resizing via mouse drag", () => {
    mount(
      <SplitPane initialSize="50%">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "flex-basis",
      "50%",
    );

    cy.get("[role=separator]").trigger("mousedown");
    cy.get("body").trigger("mousemove", { clientX: 400 });
    cy.get("body").trigger("mouseup");

    // checks if the left pane is resized
    cy.get(".SplitPane-module-split-pane-left").should(
      "not.have.css",
      "flex-basis",
      "50%",
    );
  });

  it("allows resizing via touch drag", () => {
    mount(
      <SplitPane initialSize="50%">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "flex-basis",
      "50%",
    );

    cy.get("[role=separator]").trigger("touchstart");
    cy.get("body").trigger("touchmove", { touches: [{ pageX: 400 }] });
    cy.get("body").trigger("touchend");

    // checks if the left pane is resized
    cy.get(".SplitPane-module-split-pane-left").should(
      "not.have.css",
      "flex-basis",
      "50%",
    );
  });

  it("allows resizing via keyboard", () => {
    mount(
      <SplitPane initialSize="50%">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "flex-basis",
      "50%",
    );

    cy.get("[role=separator]").trigger("keydown", { key: "ArrowRight" });
    cy.get(".SplitPane-module-split-pane-left").should(
      "not.have.css",
      "flex-basis",
      "50%",
    );

    cy.get("[role=separator]").trigger("keydown", { key: "ArrowLeft" });
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "flex-basis",
      "50%",
    );
  });

  it("drags the divider to the left edge", () => {
    const minSize = 50;
    mount(
      <SplitPane
        initialSize="50%"
        minSize={minSize}
      >
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "flex-basis",
      "50%",
    );

    cy.get("[role=separator]").trigger("mousedown");
    cy.get("body").trigger("mousemove", { clientX: -1000 });
    cy.get("body").trigger("mouseup");

    // checks if the left pane is equal to the minimum size
    cy.get(".SplitPane-module-split-pane-left").then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width).to.be.equal(minSize);
    });
  });

  it("drags the divider to the right edge", () => {
    const minSize = 50;
    mount(
      <SplitPane
        initialSize="50%"
        minSize={minSize}
      >
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
    cy.get(".SplitPane-module-split-pane-left").should(
      "have.css",
      "flex-basis",
      "50%",
    );

    cy.get("[role=separator]").trigger("mousedown");
    cy.get("body").trigger("mousemove", { clientX: window.innerWidth + 1000 });
    cy.get("body").trigger("mouseup");

    cy.get(".SplitPane-module-split-pane-left").then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width).to.be.equal(
        ($el[0].parentElement?.clientWidth || 0) - minSize,
      );
    });
  });

  it("renders long text in the panes", () => {
    const longText = "a".repeat(100);
    mount(
      <SplitPane>
        <div>{longText}</div>
        <div>{longText}</div>
      </SplitPane>,
    );
    cy.contains(longText).should("exist");
  });

  it("throws error when initial size is negative", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include("initialSize must be a positive number.");
      return false;
    });

    mount(
      <SplitPane initialSize={-100}>
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
  });

  it("throws error when minimum size is negative", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include("minSize must be a positive number.");
      return false;
    });

    mount(
      <SplitPane minSize={-100}>
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
  });

  it("throws error when initial size is not a number", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include("initialSize must be a number.");
      return false;
    });

    mount(
      <SplitPane initialSize="invalid">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
  });

  it("throws error when minimum size is not a number", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include("minSize must be a number.");
      return false;
    });

    mount(
      <SplitPane minSize="invalid">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
  });

  it("throws error when minimum size is greater than 50%", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.include(
        "minSize must be less than or equal to 50%.",
      );
      return false;
    });

    mount(
      <SplitPane minSize="60%">
        <LeftPane />
        <RightPane />
      </SplitPane>,
    );
  });
});
