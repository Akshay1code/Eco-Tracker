function DashboardMascot() {
  return (
    <div className="dashboard-mascot" aria-hidden="true">
      <div className="dashboard-mascot__speech">
        Welcome back, EcoWarrior.
      </div>

      <div className="dashboard-mascot__body">
        <div className="dashboard-mascot__perch" />

        <div className="dashboard-mascot__arm dashboard-mascot__arm--left">
          <span className="dashboard-mascot__hand">
            <span className="dashboard-mascot__finger dashboard-mascot__finger--one" />
            <span className="dashboard-mascot__finger dashboard-mascot__finger--two" />
            <span className="dashboard-mascot__finger dashboard-mascot__finger--three" />
          </span>
        </div>
        <div className="dashboard-mascot__arm dashboard-mascot__arm--right">
          <span className="dashboard-mascot__hand dashboard-mascot__hand--right" />
        </div>

        <div className="dashboard-mascot__globe">
          <span className="dashboard-mascot__continent dashboard-mascot__continent--one" />
          <span className="dashboard-mascot__continent dashboard-mascot__continent--two" />
          <span className="dashboard-mascot__continent dashboard-mascot__continent--three" />
          <span className="dashboard-mascot__continent dashboard-mascot__continent--four" />

          <div className="dashboard-mascot__face">
            <span className="dashboard-mascot__brow dashboard-mascot__brow--left" />
            <span className="dashboard-mascot__brow dashboard-mascot__brow--right" />
            <span className="dashboard-mascot__eye dashboard-mascot__eye--left">
              <span className="dashboard-mascot__eye-spark dashboard-mascot__eye-spark--big" />
              <span className="dashboard-mascot__eye-spark dashboard-mascot__eye-spark--small" />
            </span>
            <span className="dashboard-mascot__eye dashboard-mascot__eye--right">
              <span className="dashboard-mascot__eye-spark dashboard-mascot__eye-spark--big" />
              <span className="dashboard-mascot__eye-spark dashboard-mascot__eye-spark--small" />
            </span>
            <span className="dashboard-mascot__cheek dashboard-mascot__cheek--left" />
            <span className="dashboard-mascot__cheek dashboard-mascot__cheek--right" />
            <span className="dashboard-mascot__mouth">
              <span className="dashboard-mascot__tongue" />
            </span>
          </div>
        </div>

        <div className="dashboard-mascot__legs">
          <span className="dashboard-mascot__leg dashboard-mascot__leg--left">
            <span className="dashboard-mascot__shoe dashboard-mascot__shoe--left" />
          </span>
          <span className="dashboard-mascot__leg dashboard-mascot__leg--right">
            <span className="dashboard-mascot__shoe dashboard-mascot__shoe--right" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default DashboardMascot;
