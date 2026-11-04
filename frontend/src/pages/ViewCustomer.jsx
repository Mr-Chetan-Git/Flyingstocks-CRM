
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    getCustomer,
    generateCustomerSummary,
    generateCustomerPrediction
} from "../api/customerApi";

export default function ViewCustomer() {

    const { id } = useParams();

    const [customer, setCustomer] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState("");
    const [loadingPrediction, setLoadingPrediction] = useState(false);
    const [predictionError, setPredictionError] = useState("");

    useEffect(() => {

        async function loadCustomer() {

            try {

                const data = await getCustomer(id);

                setCustomer(data);

            } catch (err) {

                console.log(err);

            }

        }

        loadCustomer();

    }, [id]);


    async function handleGenerateSummary() {

        if (!customer || !customer.comments?.trim()) return;

        setLoadingSummary(true);
        setSummaryError("");

        try {

            const data = await generateCustomerSummary(id);

            if (!data || !data.success || !data.summary) {
                throw new Error(
                    data?.message || "AI did not return a summary."
                );
            }

            setCustomer(prev => ({
                ...prev,
                summary: data.summary
            }));

        } catch (err) {

            console.error("Summary generation error:", err);

            setSummaryError(
                err.response?.data?.message ||
                err.message ||
                "Failed to generate AI summary."
            );

        } finally {

            setLoadingSummary(false);

        }

    }


    async function handleGeneratePrediction() {

        if (!customer) return;

        setLoadingPrediction(true);
        setPredictionError("");

        try {

            const data = await generateCustomerPrediction(id);

            setCustomer(prev => ({
                ...prev,
                prediction: data.prediction,
                recommended_action: data.recommended_action
            }));

        } catch (err) {

            console.error("Error generating prediction:", err);

            setPredictionError(
                err.response?.data?.message ||
                "Failed to generate AI prediction."
            );

        } finally {

            setLoadingPrediction(false);

        }

    }


    const getPredictionBadge = (pred) => {

        if (!pred) {
            return <em className="text-muted">Not generated yet</em>;
        }

        const lower = pred.toLowerCase();

        let bg = "secondary";

        if (lower.includes("high")) bg = "success";
        else if (lower.includes("medium")) bg = "info";
        else if (lower.includes("needs") || lower.includes("follow")) bg = "warning";
        else if (lower.includes("low")) bg = "danger";

        return (
            <span className={`badge bg-${bg} px-3 py-2 fs-6`}>
                {pred}
            </span>
        );

    };


    if (!customer) {

        return (
            <h3 className="text-center mt-5">
                Loading...
            </h3>
        );

    }


    return (

        <div className="container mt-4">

            <h2 className="mb-4">Customer Details</h2>

            {summaryError && (
                <div className="alert alert-danger mb-3" role="alert">
                    {summaryError}
                </div>
            )}

            {predictionError && (
                <div className="alert alert-danger mb-3" role="alert">
                    {predictionError}
                </div>
            )}

            <table className="table table-bordered align-middle">

                <tbody>

                    <tr>
                        <th style={{ width: "200px" }}>Name</th>
                        <td>{customer.name}</td>
                    </tr>

                    <tr>
                        <th>Email</th>
                        <td>{customer.email}</td>
                    </tr>

                    <tr>
                        <th>Mobile</th>
                        <td>{customer.mobile}</td>
                    </tr>

                    <tr>
                        <th>Company</th>
                        <td>{customer.company}</td>
                    </tr>

                    <tr>
                        <th>Designation</th>
                        <td>{customer.designation}</td>
                    </tr>

                    <tr>
                        <th>Comments</th>
                        <td>
                            {customer.comments?.trim() ? (
                                customer.comments
                            ) : (
                                <em className="text-muted">
                                    No comments available
                                </em>
                            )}
                        </td>
                    </tr>

                    <tr>
                        <th>Summary</th>
                        <td>

                            <div className="d-flex flex-column gap-2">

                                {!customer.comments?.trim() ? (

                                    <div className="text-muted">
                                        No comments available
                                    </div>

                                ) : (

                                    <>

                                        {customer.summary && (
                                            <div className="p-3 bg-light border rounded">
                                                {customer.summary}
                                            </div>
                                        )}

                                        <div>
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleGenerateSummary}
                                                disabled={loadingSummary}
                                            >

                                                {loadingSummary ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Generating Summary...
                                                    </>
                                                ) : customer.summary ? (
                                                    "🔄 Regenerate AI Summary"
                                                ) : (
                                                    "🤖 Generate AI Summary"
                                                )}

                                            </button>
                                        </div>

                                    </>

                                )}

                            </div>

                        </td>
                    </tr>

                    <tr>
                        <th>Prediction</th>
                        <td>

                            <div className="d-flex align-items-center justify-content-between">

                                <div>
                                    {getPredictionBadge(customer.prediction)}
                                </div>

                                <button
                                    className={`btn btn-sm ${customer.prediction ? 'btn-outline-success' : 'btn-success'} ms-3 d-flex align-items-center gap-2`}
                                    onClick={handleGeneratePrediction}
                                    disabled={loadingPrediction || !customer.comments}
                                >

                                    {loadingPrediction ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            <span>Predicting...</span>
                                        </>
                                    ) : (
                                        <span>
                                            {customer.prediction
                                                ? "🔄 Regenerate AI Prediction"
                                                : "🤖 Generate AI Prediction"}
                                        </span>
                                    )}

                                </button>

                            </div>

                        </td>
                    </tr>

                    <tr>
                        <th>Recommended Action</th>
                        <td>

                            {customer.recommended_action ? (
                                <span className="fw-semibold text-dark">
                                    {customer.recommended_action}
                                </span>
                            ) : (
                                <em className="text-muted">
                                    Will be updated after AI prediction
                                </em>
                            )}

                        </td>
                    </tr>

                </tbody>

            </table>

            <Link
                to="/dashboard"
                className="btn btn-secondary"
            >
                Back to Dashboard
            </Link>

        </div>

    );

}
