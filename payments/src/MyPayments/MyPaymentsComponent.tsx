import PaymentMethod from "./PaymentMethod";
import { connect } from "react-redux";
import { AccordionSwitchComponent } from "src/Shared/Components/Accordion";
import { Accordion } from "react-bootstrap";
import { AccordionSwitchHoc } from "src/Shared/Models";
import TransactionComponent from "./TransactionHistory";
import { ApplicationState } from "src/Configs/Store";
import { CheckListState } from "src/LaunchChecklist/States";
import { Restaurant } from "src/MyRestaurant/Models/Restaurant";

interface ComponentProps {
    checklist: CheckListState;
    restaurent: Restaurant;
}

type CombinedProps = ComponentProps;

const MyPaymentsComponent: React.FC<CombinedProps> = ({
    checklist,
    restaurent,
}) => {
    const element = document.getElementById("checklist-box");
    if (element) {
        element.classList.remove("fixed-bottom");
    }

    const isRestuarantLaunched = restaurent?.listed;

    return (
        <>
            {/* <section className="page-header pb-0">
                <h3 className="page-header__page-title">My Subscription</h3>
            </section> */}

            <PaymentMethod />
            <div
                className={`items-transaction ${
                    !isRestuarantLaunched ? "bottom-space" : ""
                } `}
            >
                <TransactionComponent />
                <Accordion className="accordion-container__accordion-item">
                    <AccordionSwitchComponent
                        isHoc={true}
                        eventKey={"subscriptions"}
                    >
                        {({
                            isActiveAccordian,
                            onClick,
                        }: AccordionSwitchHoc) => {
                            return (
                                <>
                                    <div className="d-flex align-items-center justify-content-between mb-2 mt-2">
                                        <h3
                                            onClick={onClick}
                                            className="page-subheader__sub-title d-flex cursor-pointer w-100"
                                        >
                                            Subscription Plan
                                        </h3>
                                        <i
                                            onClick={onClick}
                                            className={`cursor-pointer icon-4x ${
                                                isActiveAccordian
                                                    ? "icon-angle-up"
                                                    : "icon-angle-down"
                                            }`}
                                        />
                                    </div>
                                    <Accordion.Collapse
                                        bsPrefix={
                                            "accordion-container__accordion-body w-100"
                                        }
                                        eventKey={"subscriptions"}
                                    >
                                        <div className="text-center mb-2">
                                            <div className="box empty-box-height">
                                                <h4 className="page-subheader__sub-title text-blue">
                                                    Coming Soon
                                                </h4>
                                                <p>
                                                    You can change/upgrade your
                                                    subscription here.
                                                </p>
                                            </div>
                                        </div>
                                    </Accordion.Collapse>
                                </>
                            );
                        }}
                    </AccordionSwitchComponent>
                </Accordion>
            </div>
        </>
    );
};

function mapStateToProps(state: ApplicationState) {
    return {
        checklist: state.checklist,
        restaurent: state?.restaurant?.selectedRestaurant,
    };
}

export default connect(mapStateToProps)(MyPaymentsComponent);
